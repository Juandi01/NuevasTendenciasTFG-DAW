<?php

namespace App\Controller\Admin;

use App\Entity\Mueble;
use App\Entity\Presupuesto;
use App\Entity\PresupuestoEstado;
use App\Entity\ProductMedia;
use App\Entity\ProductModel;
use App\Form\Admin\MuebleType;
use App\Repository\PresupuestoRepository;
use App\Repository\CategoryRepository;
use App\Repository\MuebleRepository;
use App\Repository\ReviewRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\UX\Turbo\TurboBundle;

#[IsGranted('ROLE_ADMIN')]
#[Route('/admin')]
class SpaceAdminController extends AbstractController
{
    // ── Dashboard ────────────────────────────────────────────

    #[Route('', name: 'app_admin_dashboard')]
    public function dashboard(
        MuebleRepository $muebles,
        ReviewRepository $reviews,
        PresupuestoRepository $budgets,
    ): Response {
        $chartLabels = [];
        $now = new \DateTimeImmutable();
        for ($i = 11; $i >= 0; $i--) {
            $chartLabels[] = $now->modify("-{$i} months")->format('M y');
        }

        return $this->render('admin/space_dashboard.html.twig', [
            'total_muebles'           => $muebles->count([]),
            'total_reviews'           => $reviews->count([]),
            'total_presupuestos'      => $budgets->count([]),
            'total_modelos'           => $muebles->count(['isActive' => true]),
            'presupuestos_pendientes' => $budgets->countPending(),
            'top_muebles'             => $muebles->findTopByReviews(5),
            'recent_reviews'          => $reviews->findRecent(5),
            'chart_labels'            => json_encode($chartLabels),
            'chart_orders'            => json_encode([3, 5, 4, 7, 12, 15, 8, 6, 9, 11, 14, 7]),
        ]);
    }

    // ── Productos — list ─────────────────────────────────────

    #[Route('/productos', name: 'app_admin_productos')]
    public function productos(
        Request $request,
        MuebleRepository $muebles,
        CategoryRepository $categories,
    ): Response {
        $filters = [
            'q'        => trim($request->query->get('q', '')),
            'category' => $request->query->get('category', ''),
            'active'   => $request->query->get('active', ''),
        ];
        $page  = max(1, (int) $request->query->get('page', 1));
        $pager = $muebles->findPaginated($filters, $page);

        return $this->render('admin/space_productos.html.twig', [
            'pager'      => $pager,
            'filters'    => $filters,
            'categories' => $categories->findAll(),
        ]);
    }

    // ── Productos — new ──────────────────────────────────────

    #[Route('/productos/nuevo', name: 'app_admin_producto_new')]
    public function productoNew(Request $request, EntityManagerInterface $em): Response
    {
        $mueble = new Mueble();
        $form   = $this->createForm(MuebleType::class, $mueble);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($mueble);
            $em->flush();
            $this->addFlash('success', "Producto \"{$mueble->getName()}\" creado correctamente.");
            return $this->redirectToRoute('app_admin_productos');
        }

        return $this->render('admin/space_producto_form.html.twig', [
            'form'   => $form,
            'mueble' => $mueble,
            'mode'   => 'new',
        ]);
    }

    // ── Productos — edit ─────────────────────────────────────

    #[Route('/productos/{id}/editar', name: 'app_admin_producto_edit')]
    public function productoEdit(
        Mueble $mueble,
        Request $request,
        EntityManagerInterface $em,
    ): Response {
        $form = $this->createForm(MuebleType::class, $mueble);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->flush();
            $this->addFlash('success', "Producto \"{$mueble->getName()}\" actualizado.");
            return $this->redirectToRoute('app_admin_productos');
        }

        return $this->render('admin/space_producto_form.html.twig', [
            'form'   => $form,
            'mueble' => $mueble,
            'mode'   => 'edit',
        ]);
    }

    // ── Productos — delete ───────────────────────────────────

    #[Route('/productos/{id}/borrar', name: 'app_admin_producto_delete', methods: ['POST'])]
    public function productoDelete(
        Mueble $mueble,
        Request $request,
        EntityManagerInterface $em,
    ): Response {
        if ($this->isCsrfTokenValid('del-' . $mueble->getId(), $request->request->get('_token'))) {
            $id   = $mueble->getId();
            $name = $mueble->getName();
            $em->remove($mueble);
            $em->flush();

            if ($request->getPreferredFormat() === TurboBundle::STREAM_FORMAT) {
                $request->setRequestFormat(TurboBundle::STREAM_FORMAT);
                return $this->render('admin/_stream_remove.html.twig', [
                    'target' => 'mueble-' . $id,
                    'name'   => $name,
                ]);
            }
        }

        return $this->redirectToRoute('app_admin_productos');
    }

    // ── Presupuestos — list ──────────────────────────────────

    #[Route('/presupuestos', name: 'app_admin_presupuestos')]
    public function presupuestos(Request $request, PresupuestoRepository $budgets): Response
    {
        $filters = [
            'q'      => trim($request->query->get('q', '')),
            'status' => $request->query->get('status', ''),
        ];
        $page  = max(1, (int) $request->query->get('page', 1));
        $pager = $budgets->findPaginated($filters, $page);

        return $this->render('admin/space_presupuestos.html.twig', [
            'pager'    => $pager,
            'filters'  => $filters,
            'statuses' => PresupuestoEstado::cases(),
        ]);
    }

    // ── Presupuestos — detail ────────────────────────────────

    #[Route('/presupuestos/{id}', name: 'app_admin_presupuesto_show')]
    public function presupuestoShow(Presupuesto $presupuesto): Response
    {
        return $this->render('admin/space_presupuesto_detail.html.twig', [
            'presupuesto' => $presupuesto,
        ]);
    }

    // ── Presupuestos — status change ─────────────────────────

    #[Route('/presupuestos/{id}/estado', name: 'app_admin_presupuesto_estado', methods: ['POST'])]
    public function presupuestoEstado(
        Presupuesto $presupuesto,
        Request $request,
        EntityManagerInterface $em,
    ): Response {
        if (!$this->isCsrfTokenValid('estado-' . $presupuesto->getId(), $request->request->get('_token'))) {
            return $this->redirectToRoute('app_admin_presupuesto_show', ['id' => $presupuesto->getId()]);
        }

        $newEstado = PresupuestoEstado::tryFrom($request->request->get('status', ''));
        if ($newEstado && in_array($newEstado, $presupuesto->getEstado()->nextStates(), true)) {
            $presupuesto->setEstado($newEstado);
            $em->flush();
        }

        if ($request->getPreferredFormat() === TurboBundle::STREAM_FORMAT) {
            $request->setRequestFormat(TurboBundle::STREAM_FORMAT);
            return $this->render('admin/_stream_presupuesto_estado.html.twig', [
                'presupuesto' => $presupuesto,
            ]);
        }

        return $this->redirectToRoute('app_admin_presupuesto_show', ['id' => $presupuesto->getId()]);
    }

    // ── Modelos / Media ──────────────────────────────────────

    #[Route('/modelos', name: 'app_admin_modelos')]
    public function modelos(MuebleRepository $muebles): Response
    {
        return $this->render('admin/space_modelos.html.twig', [
            'muebles' => $muebles->findAll(),
        ]);
    }

    // ── Upload image for a product ───────────────────────────

    #[Route('/modelos/{id}/imagen', name: 'app_admin_media_image_new', methods: ['POST'])]
    public function mediaImageNew(
        Mueble $mueble,
        Request $request,
        EntityManagerInterface $em,
    ): Response {
        if (!$this->isCsrfTokenValid('img-' . $mueble->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF inválido.');
            return $this->redirectToRoute('app_admin_modelos');
        }

        $file = $request->files->get('imageFile');
        if ($file) {
            $media = new ProductMedia();
            $media->setMueble($mueble)
                  ->setImageFile($file)
                  ->setAltText($request->request->get('altText', $mueble->getName()))
                  ->setIsPortada((bool) $request->request->get('isPortada', false));
            $em->persist($media);
            $em->flush();

            if ($request->getPreferredFormat() === TurboBundle::STREAM_FORMAT) {
                $request->setRequestFormat(TurboBundle::STREAM_FORMAT);
                return $this->render('admin/_stream_media_image.html.twig', [
                    'media'  => $media,
                    'mueble' => $mueble,
                ]);
            }
        }
        return $this->redirectToRoute('app_admin_modelos');
    }

    // ── Delete image ─────────────────────────────────────────

    #[Route('/modelos/imagen/{id}/borrar', name: 'app_admin_media_image_delete', methods: ['POST'])]
    public function mediaImageDelete(
        ProductMedia $media,
        Request $request,
        EntityManagerInterface $em,
    ): Response {
        if ($this->isCsrfTokenValid('del-img-' . $media->getId(), $request->request->get('_token'))) {
            $id = $media->getId();
            $em->remove($media);
            $em->flush();

            if ($request->getPreferredFormat() === TurboBundle::STREAM_FORMAT) {
                $request->setRequestFormat(TurboBundle::STREAM_FORMAT);
                return $this->render('admin/_stream_remove.html.twig', [
                    'target' => 'media-img-' . $id,
                    'name'   => 'imagen',
                ]);
            }
        }
        return $this->redirectToRoute('app_admin_modelos');
    }

    // ── Upload 3D model for a product ────────────────────────

    #[Route('/modelos/{id}/modelo', name: 'app_admin_media_model_new', methods: ['POST'])]
    public function mediaModelNew(
        Mueble $mueble,
        Request $request,
        EntityManagerInterface $em,
    ): Response {
        if (!$this->isCsrfTokenValid('mdl-' . $mueble->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF inválido.');
            return $this->redirectToRoute('app_admin_modelos');
        }

        $file = $request->files->get('modelFile');
        if ($file) {
            $ext = strtolower($file->getClientOriginalExtension());
            if (!in_array($ext, ['glb', 'gltf'], true)) {
                $this->addFlash('error', 'Solo se admiten archivos .glb o .gltf');
                return $this->redirectToRoute('app_admin_modelos');
            }

            $model = new ProductModel();
            $model->setMueble($mueble)
                  ->setModelFile($file)
                  ->setDisplayName($request->request->get('displayName') ?: $file->getClientOriginalName());
            $em->persist($model);
            $em->flush();

            if ($request->getPreferredFormat() === TurboBundle::STREAM_FORMAT) {
                $request->setRequestFormat(TurboBundle::STREAM_FORMAT);
                return $this->render('admin/_stream_media_model.html.twig', [
                    'model'  => $model,
                    'mueble' => $mueble,
                ]);
            }
        }
        return $this->redirectToRoute('app_admin_modelos');
    }

    // ── Delete 3D model ──────────────────────────────────────

    #[Route('/modelos/modelo/{id}/borrar', name: 'app_admin_media_model_delete', methods: ['POST'])]
    public function mediaModelDelete(
        ProductModel $model,
        Request $request,
        EntityManagerInterface $em,
    ): Response {
        if ($this->isCsrfTokenValid('del-mdl-' . $model->getId(), $request->request->get('_token'))) {
            $id = $model->getId();
            $em->remove($model);
            $em->flush();

            if ($request->getPreferredFormat() === TurboBundle::STREAM_FORMAT) {
                $request->setRequestFormat(TurboBundle::STREAM_FORMAT);
                return $this->render('admin/_stream_remove.html.twig', [
                    'target' => 'media-mdl-' . $id,
                    'name'   => 'modelo 3D',
                ]);
            }
        }
        return $this->redirectToRoute('app_admin_modelos');
    }
}
