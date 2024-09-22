# Geo Widget Frontend

A Web user interface for the Geo Widget API to provide information about an IP address. The API exists as a separate project written in both Rust and Python. This Web UI is written in JavaScript using the htmx and bun frameworks.

## Workflow

* Load the form HTML structure and required JavaScript and CSS files.
* When the requesting URL **does not** contain a specific address:
  * Make a request to the Geo Widget API using: `/address`
  * The API will lookup and return information about the client's address
* When the requesting URL **does** contain a specific address: `?address=<ADDRESS>`
  * Make a request to the Geo Widget API using: `/address/<ADDRESS>`
  * The API will lookup and return information about the specific address
* Load the JSON response data into the form
* Load a map of where the address is believed to be located
