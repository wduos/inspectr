# inspectr

This [web interface](https://wduos.github.io/inspectr/) provides a more intuitive and responsive experience for the warehouse receiving inspection process.

This repository is currently public to allow for potential code reviews and inspections. I intentionally chose a simple HTML, CSS, and JavaScript stack instead of a more sophisticated approach in order to prioritize simplicity and ensure easy deployment through GitHub Pages.

If **inspectr** is ever implemented in the warehouse, I may consider adopting a more scalable architecture.

## Functionality

**inspectr** allows the user to select an initial SKU (product code), which is then used as a reference for subsequent barcode scans.

- Some safety measures are implemented to ensure that the user is scanning a valid SKU rather than a nearby barcode on the box.
- A success sound is played when the scanned SKU matches the reference SKU, while an error sound is played for mismatched or invalid barcodes (non-SKU codes). This minimizes the need for the user to constantly look at the screen to verify whether an error has occurred.
- A counter keeps track of how many boxes have been scanned, allowing the user to monitor progress during the inspection.
- A straightforward UI with color-coded actions/buttons and confirmation modals designed to help prevent mistakes.
- The ability to resume an inspection that was not properly completed by storing the reference SKU locally.

## Disclaimer

This project is an independent personal initiative and is not officially affiliated with, endorsed by, or sponsored by the company to which I am developing it to.

The repository is publicly available for demonstration and evaluation purposes only. Any potential internal adoption, integration, or production use would be subject to separate internal review and approval processes.
