import { cyan, dim } from "./color.js";
import { readPackageVersion } from "./version.js";
export function printBanner() {
    const version = readPackageVersion();
    const title = cyan("BlockClaw Manager");
    const ver = dim(`v${version}`);
    console.log(`${title} ${ver}`);
}
