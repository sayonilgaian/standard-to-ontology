const N3 = require('n3');

function createRelationTriple({ writer, value, key, prefix }) {
	const subjectIRI = toSafeIRI(key);
	const objectIRI = toSafeIRI(value.connectedBusinessObject);
	const propertyIRI = `contains${objectIRI}`;

	// Declare the object property
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}${propertyIRI}`),
		N3.DataFactory.namedNode('rdf:type'),
		N3.DataFactory.namedNode('owl:ObjectProperty')
	);

	// Set domain (subject class)
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}${propertyIRI}`),
		N3.DataFactory.namedNode('rdfs:domain'),
		N3.DataFactory.namedNode(`${prefix}${subjectIRI}`)
	);

	// Set range (object class)
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}${propertyIRI}`),
		N3.DataFactory.namedNode('rdfs:range'),
		N3.DataFactory.namedNode(`${prefix}${objectIRI}`)
	);

	// Add a label for the property
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}${propertyIRI}`),
		N3.DataFactory.namedNode('rdfs:label'),
		N3.DataFactory.literal(
			`contains ${value.connectedBusinessObject}`
		)
	);

	// Optional: add labels to subject & object again for clarity
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}${subjectIRI}`),
		N3.DataFactory.namedNode('rdfs:label'),
		N3.DataFactory.literal(key)
	);
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}${objectIRI}`),
		N3.DataFactory.namedNode('rdfs:label'),
		N3.DataFactory.literal(value.connectedBusinessObject)
	);
}

// Helper to create PascalCase-safe IRI names
const toSafeIRI = (str) => {
	if (!str || typeof str !== 'string') return null;
	return str
		.trim()
		.replace(/[^a-zA-Z0-9\s]/g, '')
		.split(/\s+/)
		.map(
			(word) =>
				word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join('');
};

module.exports = createRelationTriple;
