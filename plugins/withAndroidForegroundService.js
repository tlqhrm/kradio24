const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Android 14+ Foreground Service 설정
 * - FOREGROUND_SERVICE_MEDIA_PLAYBACK 권한 추가
 * - 2025년 Google Play Store 규정 준수
 */
const withAndroidForegroundService = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // tools namespace 추가 (없는 경우)
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // 권한 배열 초기화
    manifest['uses-permission'] = manifest['uses-permission'] || [];

    // FOREGROUND_SERVICE_MEDIA_PLAYBACK 권한 추가
    const requiredPermissions = [
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    ];

    requiredPermissions.forEach((permission) => {
      const exists = manifest['uses-permission'].some(
        (p) => p.$['android:name'] === permission
      );
      if (!exists) {
        manifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    // Deprecated Storage 권한 제거 (Android 13+에서 불필요)
    const deprecatedPermissions = [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ];

    manifest['uses-permission'] = manifest['uses-permission'].filter(
      (p) => !deprecatedPermissions.includes(p.$['android:name'])
    );

    return config;
  });
};

module.exports = withAndroidForegroundService;