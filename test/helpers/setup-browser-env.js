import browserEnv from 'browser-env';
import hook from 'vue-node';
import { join } from 'path';

browserEnv();
hook(join(__dirname, 'webpack.config.test.js'));
