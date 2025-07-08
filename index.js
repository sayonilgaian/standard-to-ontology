const boBpData = require('./data/BPs.json');
const { createTriples } = require('./utils/createOwlClasses.js');

async function main() {
	const businessObjectMap = new Map();
	const businessProcessMap = new Map();

	for (let i = 0; i < boBpData.length; i++) {
		const element = boBpData[i];
		const businessObject = element.object;
		const businessProcess = element.name;

		// add unique business objects
		if (!businessObjectMap.has(businessObject)) {
			businessObjectMap.set(businessObject, true);
		}

		// add unique business processes
		if (!businessProcessMap.has(businessProcess)) {
			businessProcessMap.set(businessProcess, element.subprocesses);
		}
	}

	createTriples(
		Array.from(businessObjectMap.keys()),
		Array.from(businessProcessMap.keys())
	);
}

main();
