// const boBpData = require('./data/test.json');
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

		element.subprocesses.forEach((subprocess) => {
			if (!businessObjectMap.has(subprocess.object)) {
				businessObjectMap.set(subprocess.object, true);
			}
		});

		// add unique business processes
		if (!businessProcessMap.has(businessProcess)) {
			businessProcessMap.set(businessProcess, {
				subprocesses: element.subprocesses,
				connectedBusinessObject: businessObject,
			});
		}

		element.subprocesses.forEach((subprocess) => {
			if (!businessProcessMap.has(subprocess.name)) {
				businessProcessMap.set(subprocess.name, {
					subprocesses: [],
					connectedBusinessObject: subprocess.object,
				});
			}
		});
	}

	createTriples({
		businessObjects: Array.from(businessObjectMap.keys()),
		businessProcesses: Array.from(businessProcessMap.keys()),
		relations: businessProcessMap,
		standardName: 'IRC37',
	});
}

main();
