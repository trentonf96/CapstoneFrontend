import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Acoustic Measure',
  webDir: 'build',
  bundledWebRuntime: false,
  android: {
    allowMixedContent:true
  }
};

export default config;
