<script>
    export const prerender = true;

    import * as Papa from 'papaparse';

    let fileName = '';
    let rows = [];
    let headers = [];
    let uniqueVariants = new Set();
    let selectedHeader = '';
    let showDropdown = false;
    let showProcessButton = false;
    let statusMessage = '';

    const excludedHeaders = [
        'Name', 'Brand', 'Supplier', 'SKU', 'Warehouse Location', 'EAN', 'Style Number',
        'HS Code', 'Unit Cost', 'Variant', 'Variant Title', 'Size/Volume', 'Category',
        'Sub-Category', 'Groups', 'Color', 'Material', 'Dimensions', 'Unit weight',
        'Unit volume', 'EUR', 'DKK', 'NOK', 'SEK', 'RRP_EUR', 'RRP_DKK', 'RRP_NOK',
        'RRP_SEK', 'Discount Tiers', 'Stock', 'Allow Backorders', 'Purchase Requirements',
        'Case Quantity', 'UOM', 'Description', 'New Product', 'Images', 'Units Ordered',
        'Orders Count'
    ];

    function formatPrice(value) {
        return parseFloat(value)
            .toFixed(2)
            .replace('.', ',')
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function handleFileChange(event) {
        const fileInput = event.target;
        if (fileInput.files.length > 0) {
            fileName = fileInput.files[0].name;
            parseCSV(fileInput.files[0]);
        }
    }

    function parseCSV(file) {
        Papa.parse(file, {
            header: true,
            delimiter: ";",
            complete: function (results) {
                headers = results.meta.fields.filter(header => !excludedHeaders.includes(header));
                rows = results.data;
                showDropdown = true;
                showProcessButton = false;
                statusMessage = 'Vælg en kolonne til priser fra dropdown.';
            }
        });
    }

    function processCSV() {
        if (!selectedHeader) {
            alert('Vælg venligst en priskolonne.');
            return;
        }

        let processedRows = [];

        rows.forEach(row => {
            let priceValue = row[selectedHeader] ? row[selectedHeader].trim() : null;
            const variantValue = row['Variant'] ? row['Variant'].trim() : null;

            if (priceValue) {
                priceValue = formatPrice(priceValue);

                if (variantValue && !uniqueVariants.has(variantValue)) {
                    uniqueVariants.add(variantValue);

                    const filteredRow = {
                        Name: row['Name'],
                        Brand: row['Brand'],
                        SKU: row['SKU'],
                        Price: priceValue,
                        Description: row['Description'],
                        Images: row['Images']
                    };
                    processedRows.push(filteredRow);
                }
            }
        });

        downloadCSV(processedRows);
    }

    function downloadCSV(rows) {
        const csv = Papa.unparse(rows, {
            quotes: true,
            delimiter: ";",
            header: true
        });

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], {
            type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedHeader}_canva.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        statusMessage = 'Filtreret CSV-fil er nu klar til download!';
    }
</script>

<div class="container mx-auto py-10">
    <h1 class="text-3xl font-bold text-center mb-5">Turis til Canva</h1>

    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div class="mb-4">
            <p class="block text-lg font-semibold mb-2">Vælg Turis produkt CSV</p>
            <div class="relative">
                <input type="file" id="csvFileInput" accept=".csv" class="hidden" on:change={handleFileChange}>
                <button type="button"
                    class="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300"
                    on:click={()=> document.getElementById('csvFileInput').click()}>
                    Vælg fil
                </button>
                <span class="ml-2 text-sm text-gray-600">{fileName}</span>
            </div>
        </div>

        {#if showDropdown}
      <div class="mb-4">
        <label for="headerDropdown" class="block text-lg font-semibold mb-2">Vælg prisliste</label>
        <select id="headerDropdown" bind:value={selectedHeader} class="block w-full border p-2 rounded-lg max-h-48 overflow-y-auto">
          {#each headers as header}
            <option value={header}>{header}</option>
          {/each}
        </select>
      </div>
    {/if}

    {#if showDropdown}
      <button class="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600" on:click={processCSV}>
        Generer CSV
      </button>
    {/if}
  </div>

  <p id="statusMessage" class="text-center mt-5">{statusMessage}</p>
</div>