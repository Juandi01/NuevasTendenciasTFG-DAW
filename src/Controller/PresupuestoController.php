<?php

namespace App\Controller;

use App\Entity\Mueble;
use App\Entity\Presupuesto;
use App\Entity\Variation;
use Doctrine\ORM\EntityManagerInterface;
use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;

class PresupuestoController extends AbstractController
{
    /** Configurador 3D asociado a un producto concreto */
    #[Route('/mueble/{id}/configurar', name: 'app_mueble_configurar', methods: ['GET'])]
    public function configurar(Mueble $mueble): Response
    {
        return $this->render('mueble/configurator.html.twig', [
            'mueble'     => $mueble,
            'productKey' => $this->toProductKey($mueble->getName()),
            'lockedMode' => true,
        ]);
    }

    private function toProductKey(string $name): string
    {
        return match ($name) {
            'Orión'     => 'orion',
            'Sirio'     => 'sirio',
            'Vega'      => 'vega',
            'Andrómeda' => 'andromeda',
            'Nebula'    => 'nebula',
            'Cassiopea' => 'cassiopea',
            'Altair'    => 'altair',
            'Lyra'      => 'lyra',
            'Perseo'    => 'perseo',
            default     => strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name)),
        };
    }

    /** Guarda la solicitud de presupuesto */
    #[Route('/presupuesto/solicitar', name: 'app_presupuesto_solicitar', methods: ['POST'])]
    public function solicitar(Request $request, EntityManagerInterface $em, MailerInterface $mailer): Response
    {
        $name  = trim($request->request->get('customerName', ''));
        $email = trim($request->request->get('customerEmail', ''));
        $phone = trim($request->request->get('customerPhone', '')) ?: null;
        $notes = trim($request->request->get('notes', '')) ?: null;

        if (!$name || !$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            if ($request->isXmlHttpRequest()) {
                return $this->json(['success' => false, 'error' => 'Completa nombre y email correctamente.'], 422);
            }
            $this->addFlash('error', 'Por favor completa nombre y email correctamente.');
            return $this->redirectToRoute('app_home');
        }

        $presupuesto = new Presupuesto();
        $presupuesto
            ->setCustomerName($name)
            ->setCustomerEmail($email)
            ->setCustomerPhone($phone)
            ->setNotes($notes)
            ->setConfiguracionModelo($request->request->get('configuracionModelo') ?: null)
            ->setConfiguracionTapiceria($request->request->get('configuracionTapiceria') ?: null)
            ->setConfiguracionColor($request->request->get('configuracionColor') ?: null)
            ->setConfiguracionPatas($request->request->get('configuracionPatas') ?: null);

        // Vincula el mueble si viene en el formulario
        $muebleId = $request->request->getInt('muebleId', 0);
        if ($muebleId > 0) {
            $mueble = $em->find(Mueble::class, $muebleId);
            if ($mueble) {
                $presupuesto->setMueble($mueble);
            }
        }

        // Vincula la variation si se seleccionó en el wizard
        $varId = $request->request->getInt('variationId', 0);
        if ($varId > 0) {
            $variation = $em->find(Variation::class, $varId);
            if ($variation && $variation->getMueble() === $presupuesto->getMueble()) {
                $presupuesto->setSelectedVariation($variation);
            }
        }

        $em->persist($presupuesto);
        $em->flush();

        $emailHtml = $this->renderView('presupuesto/email_confirmacion.html.twig', [
            'presupuesto' => $presupuesto,
        ]);

        $pdfContent  = $this->buildPdf($presupuesto);
        $pdfFilename = sprintf('presupuesto-%d-nuevastendencias.pdf', $presupuesto->getId());

        $email = (new Email())
            ->from('noreply@nuevastendencias.es')
            ->to($presupuesto->getCustomerEmail())
            ->subject('Tu solicitud de presupuesto ha sido recibida - Nuevas Tendencias')
            ->html($emailHtml)
            ->attach($pdfContent, $pdfFilename, 'application/pdf');

        $mailer->send($email);

        $mueble = $presupuesto->getMueble();
        $redirect = $mueble
            ? $this->generateUrl('app_mueble_show', ['id' => $mueble->getId()])
            : $this->generateUrl('app_home');

        if ($request->isXmlHttpRequest()) {
            return $this->json([
                'success' => true,
                'redirect' => $redirect,
                'pdfUrl'  => $this->generateUrl('app_presupuesto_pdf', ['id' => $presupuesto->getId()]),
            ]);
        }

        $this->addFlash('success', '¡Solicitud enviada! Nos pondremos en contacto pronto.');
        return $this->redirect($redirect);
    }

    /** Genera y descarga el PDF del presupuesto */
    #[Route('/presupuesto/{id}/pdf', name: 'app_presupuesto_pdf', methods: ['GET'])]
    public function pdf(Presupuesto $presupuesto): Response
    {
        $filename = sprintf('presupuesto-%d-nuevastendencias.pdf', $presupuesto->getId());

        return new Response(
            $this->buildPdf($presupuesto),
            200,
            [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => sprintf('attachment; filename="%s"', $filename),
            ]
        );
    }

    private function buildPdf(Presupuesto $presupuesto): string
    {
        $html = $this->renderView('presupuesto/pdf.html.twig', [
            'presupuesto' => $presupuesto,
        ]);

        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
