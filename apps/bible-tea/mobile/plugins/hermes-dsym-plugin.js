const { withXcodeProject } = require("expo/config-plugins");

module.exports = function withHermesDsym(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const targetKey = project.getFirstTarget().uuid;

    const shellScript = `
if [ "\${ACTION}" = "install" ] && [ -d "\${DWARF_DSYM_FOLDER_PATH}" ]; then
  HERMES_DSYM="\${PODS_ROOT}/../hermes-dsym/hermes.framework.dSYM"
  if [ -d "$HERMES_DSYM" ]; then
    cp -R "$HERMES_DSYM" "\${DWARF_DSYM_FOLDER_PATH}/"
    echo "Copied Hermes dSYM to archive"
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
