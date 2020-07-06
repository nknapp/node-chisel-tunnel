module.exports = {
	mockChecksums(version) {
		return `
mockChecksum-${version}-linux_armv6  chisel_${version}_linux_armv6.gz
mockChecksum-${version}-linux_mipsle_softfloat  chisel_${version}_linux_mipsle_softfloat.gz
mockChecksum-${version}-linux_arm64  chisel_${version}_linux_arm64.gz
mockChecksum-${version}-windows_386  chisel_${version}_windows_386.gz
mockChecksum-${version}-darwin_386  chisel_${version}_darwin_386.gz
mockChecksum-${version}-darwin_amd64  chisel_${version}_darwin_amd64.gz
mockChecksum-${version}-linux_mips64_hardfloat  chisel_${version}_linux_mips64_hardfloat.gz
mockChecksum-${version}-linux_amd64  chisel_${version}_linux_amd64.gz
mockChecksum-${version}-linux_386  chisel_${version}_linux_386.gz
mockChecksum-${version}-linux_mips_softfloat  chisel_${version}_linux_mips_softfloat.gz
mockChecksum-${version}-linux_armv7  chisel_${version}_linux_armv7.gz
mockChecksum-${version}-linux_mipsle_hardfloat  chisel_${version}_linux_mipsle_hardfloat.gz
mockChecksum-${version}-windows_amd64  chisel_${version}_windows_amd64.gz
mockChecksum-${version}-linux_mips64le_softfloat  chisel_${version}_linux_mips64le_softfloat.gz
mockChecksum-${version}-linux_mips64_softfloat  chisel_${version}_linux_mips64_softfloat.gz
mockChecksum-${version}-linux_s390x  chisel_${version}_linux_s390x.gz
mockChecksum-${version}-linux_mips64le_hardfloat  chisel_${version}_linux_mips64le_hardfloat.gz
mockChecksum-${version}-linux_ppc64le  chisel_${version}_linux_ppc64le.gz
mockChecksum-${version}-linux_mips_hardfloat  chisel_${version}_linux_mips_hardfloat.gz
mockChecksum-${version}-linux_ppc64  chisel_${version}_linux_ppc64.gz
`.trim();
	},
};
