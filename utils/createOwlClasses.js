const N3 = require('n3');
const fs = require('fs');
const createRelationTriple = require('./createRelationTriple');

function createTriples({
	businessObjects = [''],
	businessProcesses = [''],
	relations = new Map(),
	standardName = '',
}) {
	const writer = new N3.Writer({ format: 'text/turtle' });

	const prefix = 'http://example.org/standardOntology#';

	writer.addPrefix('', prefix);
	writer.addPrefix(
		'rdf',
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
	);
	writer.addPrefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');
	writer.addPrefix('owl', 'http://www.w3.org/2002/07/owl#');
	writer.addPrefix('xsd', 'http://www.w3.org/2001/XMLSchema#');

	// Declare ontology
	writer.addQuad(
		N3.DataFactory.namedNode(prefix.slice(0, -1)),
		N3.DataFactory.namedNode('rdf:type'),
		N3.DataFactory.namedNode('owl:Ontology')
	);

	// Base classes
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}BusinessObject`),
		N3.DataFactory.namedNode('rdf:type'),
		N3.DataFactory.namedNode('owl:Class')
	);
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}BusinessProcess`),
		N3.DataFactory.namedNode('rdf:type'),
		N3.DataFactory.namedNode('owl:Class')
	);
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}${standardName}`),
		N3.DataFactory.namedNode('rdf:type'),
		N3.DataFactory.namedNode('owl:Class')
	);

	// standard link with business object and props main classes
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}BusinessProcess`),
		N3.DataFactory.namedNode('rdfs:subClassOf'),
		N3.DataFactory.namedNode(`${prefix}${standardName}`)
	);
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}BusinessObject`),
		N3.DataFactory.namedNode('rdfs:subClassOf'),
		N3.DataFactory.namedNode(`${prefix}${standardName}`)
	);

	const validBusinessObjects = businessObjects
		.filter(
			(obj) => obj && typeof obj === 'string' && obj.trim().length > 0
		)
		.map((obj) => sanitizeClassName(obj))
		.filter((obj) => obj !== 'undefined' && obj !== 'null');
	const uniqueBusinessObjects = [...new Set(validBusinessObjects)];

	const validBusinessProcesses = businessProcesses
		.filter(
			(obj) => obj && typeof obj === 'string' && obj.trim().length > 0
		)
		.map((obj) => sanitizeClassName(obj))
		.filter((obj) => obj !== 'undefined' && obj !== 'null');
	const uniqueBusinessProcesses = [
		...new Set(validBusinessProcesses),
	];

	// Add business object classes
	uniqueBusinessObjects.forEach((object) => {
		writer.addQuad(
			N3.DataFactory.namedNode(`${prefix}${object}`),
			N3.DataFactory.namedNode('rdf:type'),
			N3.DataFactory.namedNode('owl:Class')
		);
		writer.addQuad(
			N3.DataFactory.namedNode(`${prefix}${object}`),
			N3.DataFactory.namedNode('rdfs:subClassOf'),
			N3.DataFactory.namedNode(`${prefix}BusinessObject`)
		);
		writer.addQuad(
			N3.DataFactory.namedNode(`${prefix}${object}`),
			N3.DataFactory.namedNode('rdfs:label'),
			N3.DataFactory.literal(object)
		);
	});

	// Add business process classes
	uniqueBusinessProcesses.forEach((process) => {
		writer.addQuad(
			N3.DataFactory.namedNode(`${prefix}${process}`),
			N3.DataFactory.namedNode('rdf:type'),
			N3.DataFactory.namedNode('owl:Class')
		);
		writer.addQuad(
			N3.DataFactory.namedNode(`${prefix}${process}`),
			N3.DataFactory.namedNode('rdfs:subClassOf'),
			N3.DataFactory.namedNode(`${prefix}BusinessProcess`)
		);
		writer.addQuad(
			N3.DataFactory.namedNode(`${prefix}${process}`),
			N3.DataFactory.namedNode('rdfs:label'),
			N3.DataFactory.literal(process)
		);
	});

	// Add specific object properties for each relation
	relations.forEach((value, key) => {
		createRelationTriple({ prefix, writer, value, key });

		if (value.subprocesses.length > 0) {
			value.subprocesses.forEach((subprocess) => {
				createRelationTriple({
					prefix,
					writer,
					key,
					value: {
						connectedBusinessObject: subprocess.object,
					},
				});
			});
		}
	});

	// Write to file
	writer.end((error, result) => {
		if (error) {
			console.error('Error writing RDF:', error);
		} else {
			fs.writeFileSync('ontology.ttl', result);
			console.log(
				'OWL ontology written to ontology.ttl in Turtle format'
			);
		}
	});
}

// Helper function to sanitize names for IRIs
function sanitizeClassName(name) {
	if (!name || typeof name !== 'string') return null;
	return name
		.trim()
		.replace(/[^a-zA-Z0-9\s]/g, '')
		.split(/\s+/)
		.map(
			(word) =>
				word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join('');
}

module.exports = { createTriples };
