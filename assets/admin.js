import '@hotwired/turbo';
import { Application } from '@hotwired/stimulus';
import ModelViewerController from './controllers/model_viewer_controller.js';

const app = Application.start();
app.register('model-viewer', ModelViewerController);
