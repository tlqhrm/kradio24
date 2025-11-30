const { withStringsXml, withInfoPlist, IOSConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Android 앱 이름 로컬라이제이션
 */
const withAndroidLocalizedName = (config) => {
  return withStringsXml(config, (config) => {
    const koStringsDir = path.join(
      config.modRequest.platformProjectRoot,
      'app/src/main/res/values-ko'
    );
    const koStringsPath = path.join(koStringsDir, 'strings.xml');

    if (!fs.existsSync(koStringsDir)) {
      fs.mkdirSync(koStringsDir, { recursive: true });
    }

    const koStringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">한국라디오24</string>
</resources>
`;

    fs.writeFileSync(koStringsPath, koStringsXml, 'utf-8');

    return config;
  });
};

/**
 * iOS 앱 이름 로컬라이제이션
 */
const withIOSLocalizedName = (config) => {
  return withInfoPlist(config, (config) => {
    const projectRoot = config.modRequest.platformProjectRoot;
    const projectName = config.modRequest.projectName || 'KRadio24';

    // 한국어 lproj 디렉토리
    const koLprojDir = path.join(projectRoot, projectName, 'Supporting', 'ko.lproj');
    const koStringsPath = path.join(koLprojDir, 'InfoPlist.strings');

    // 영어 lproj 디렉토리
    const enLprojDir = path.join(projectRoot, projectName, 'Supporting', 'en.lproj');
    const enStringsPath = path.join(enLprojDir, 'InfoPlist.strings');

    // 한국어 InfoPlist.strings
    if (fs.existsSync(koLprojDir)) {
      const koContent = `CFBundleDisplayName = "한국라디오24";
CFBundleName = "한국라디오24";
`;
      fs.writeFileSync(koStringsPath, koContent, 'utf-8');
    }

    // 영어 InfoPlist.strings
    if (fs.existsSync(enLprojDir)) {
      const enContent = `CFBundleDisplayName = "KRadio24";
CFBundleName = "KRadio24";
`;
      fs.writeFileSync(enStringsPath, enContent, 'utf-8');
    }

    return config;
  });
};

/**
 * 통합 플러그인
 */
const withLocalizedAppName = (config) => {
  config = withAndroidLocalizedName(config);
  config = withIOSLocalizedName(config);
  return config;
};

module.exports = withLocalizedAppName;