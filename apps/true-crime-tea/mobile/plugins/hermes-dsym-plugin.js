const { withXcodeProject } = require("expo/config-plugins");

module.exports = function withHermesDsym(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const targetKey = project.getFirstTarget().uuid;

    const shellScript = `
if [ "\${ACTION}" = "install" ] && [ -d "\${DWARF_DSYM_FOLDER_PATH}" ]; then
  HERMES_FW="\${BUILD_DIR}/\${CONFIGURATION}-iphoneos/hermes.framework/hermes"
  if [ ! -f "$HERMES_FW" ]; then
    HERMES_FW=$(find "\${PODS_ROOT}/hermes-engine" -path "*/ios-arm64/hermes.framework/hermes" -type f 2>/dev/null | head -1)
  fi
  if [ -f "$HERMES_FW" ]; then
    dsymutil "$HERMES_FW" -o "\${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM"
    echo "Generated Hermes dSYM via dsymutil"
  else
    echo "warning: Could not find hermes binary for dSYM generation"
  fi
fi
`.trim();

    project.addBuildPhase(
      [],
      "PBXShellScriptBuildPhase",
      "[Hermes] Copy dSYM to Archive",
      targetKey,
      { shellPath: "/bin/sh", shellScript }
    );

    return config;
  });
};
