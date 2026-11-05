// Bridge: packages the npm plugin opencode-antigravity-auth (already installed
// in ~/.config/opencode/node_modules) into a plugin loaded directly by opencode
// from this directory. Necessary because this opencode build (1.18.32) does not
// overlay plugins from the "plugin" config key.
export { default } from "opencode-antigravity-auth"
