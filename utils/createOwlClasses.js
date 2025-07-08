const N3 = require('n3');
const fs = require('fs');

function createTriples(businessObjects) {
	// Create a writer for Turtle format (easier to debug than RDF/XML)
	const writer = new N3.Writer({ format: 'text/turtle' });

	// Define the prefix for the ontology
	const prefix = 'http://example.org/standardOntology#';

	// Add prefix declarations
	writer.addPrefix('', prefix);
	writer.addPrefix(
		'rdf',
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
	);
	writer.addPrefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');
	writer.addPrefix('owl', 'http://www.w3.org/2002/07/owl#');
	writer.addPrefix('xsd', 'http://www.w3.org/2001/XMLSchema#');

	// Declare this as an OWL ontology
	writer.addQuad(
		N3.DataFactory.namedNode(prefix.slice(0, -1)), // Remove the # for ontology IRI
		N3.DataFactory.namedNode(
			'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
		),
		N3.DataFactory.namedNode('http://www.w3.org/2002/07/owl#Ontology')
	);

	// Define the BusinessObject as an OWL class
	writer.addQuad(
		N3.DataFactory.namedNode(`${prefix}BusinessObject`),
		N3.DataFactory.namedNode(
			'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
		),
		N3.DataFactory.namedNode('http://www.w3.org/2002/07/owl#Class')
	);

	// Filter and clean the business objects array
	const validBusinessObjects = businessObjects
		.filter(
			(obj) => obj && typeof obj === 'string' && obj.trim().length > 0
		)
		.map((obj) => obj.trim())
		.filter((obj) => obj !== 'undefined' && obj !== 'null')
		.map((obj) => sanitizeClassName(obj));

	// Remove duplicates
	const uniqueBusinessObjects = [...new Set(validBusinessObjects)];

	console.log('Processing business objects:', uniqueBusinessObjects);

	// Define subclasses for each business object
	uniqueBusinessObjects.forEach((object) => {
		if (object && object.length > 0) {
			// Declare the class
			writer.addQuad(
				N3.DataFactory.namedNode(`${prefix}${object}`),
				N3.DataFactory.namedNode(
					'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
				),
				N3.DataFactory.namedNode(
					'http://www.w3.org/2002/07/owl#Class'
				)
			);

			// Make it a subclass of BusinessObject
			writer.addQuad(
				N3.DataFactory.namedNode(`${prefix}${object}`),
				N3.DataFactory.namedNode(
					'http://www.w3.org/2000/01/rdf-schema#subClassOf'
				),
				N3.DataFactory.namedNode(`${prefix}BusinessObject`)
			);

			// Add a label for better readability
			writer.addQuad(
				N3.DataFactory.namedNode(`${prefix}${object}`),
				N3.DataFactory.namedNode(
					'http://www.w3.org/2000/01/rdf-schema#label'
				),
				N3.DataFactory.literal(object)
			);
		}
	});

	// Output the Turtle format to a file
	writer.end((error, result) => {
		if (error) {
			console.error('Error writing RDF:', error);
		} else {
			fs.writeFileSync('ontology.ttl', result);
			console.log(
				'OWL ontology written to ontology.ttl in Turtle format'
			);
			console.log('Generated ontology preview:');
			console.log(result.substring(0, 500) + '...');
		}
	});
}

// Helper function to sanitize class names for RDF
function sanitizeClassName(name) {
	if (!name || typeof name !== 'string') {
		return null;
	}

	// Remove invalid characters and convert to PascalCase
	return name
		.trim()
		.replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
		.split(/\s+/) // Split by whitespace
		.map(
			(word) =>
				word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join('');
}

// Example usage with sample data
function testOntology() {
	const sampleBusinessObjects = [
		'Material',
		'Equipment',
		'Guidelines',
		'Subgrade',
		'Quality Control',
		'Safety Protocol',
		'Environmental Impact',
		'Cost Analysis',
		'Project Timeline',
		'Resource Allocation',
	];

	createTriples(sampleBusinessObjects);
}

// Export both functions
module.exports = { createTriples, testOntology };
