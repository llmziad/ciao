import { normalizeSocial } from "../src/lib/socials";

const expectOk: [Parameters<typeof normalizeSocial>[0], string, string][] = [
  ["instagram", "@john", "https://instagram.com/john"],
  ["instagram", "john.doe", "https://instagram.com/john.doe"],
  ["instagram", "https://instagram.com/john", "https://instagram.com/john"],
  ["instagram", "instagram.com/john", "https://instagram.com/john"],
  ["twitter", "@foo", "https://x.com/foo"],
  ["twitter", "https://twitter.com/foo", "https://twitter.com/foo"],
  ["linkedin", "linkedin.com/in/foo", "https://linkedin.com/in/foo"],
  ["linkedin", "foo-bar", "https://linkedin.com/in/foo-bar"],
  ["facebook", "www.facebook.com/foo", "https://www.facebook.com/foo"],
];

const expectThrow: [Parameters<typeof normalizeSocial>[0], string][] = [
  ["facebook", "https://evil.com/foo"],
  ["instagram", "javascript:alert(1)"],
  ["instagram", "https://instagram.com.evil.com/x"],
];

let pass = 0;
let fail = 0;
for (const [net, input, exp] of expectOk) {
  const got = normalizeSocial(net, input);
  const ok = got === exp;
  console.log(`${ok ? "PASS" : "FAIL"}  ${net} "${input}" -> ${got}`);
  ok ? pass++ : fail++;
}
for (const [net, input] of expectThrow) {
  try {
    const got = normalizeSocial(net, input);
    console.log(`FAIL  ${net} "${input}" should have thrown, got ${got}`);
    fail++;
  } catch {
    console.log(`PASS  ${net} "${input}" -> rejected`);
    pass++;
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
