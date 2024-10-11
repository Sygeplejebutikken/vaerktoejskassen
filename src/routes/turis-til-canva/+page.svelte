<script>
    import * as Papa from 'papaparse';

    let fileName = '';
    let rows = [];
    let headers = [];
    let uniqueVariants = new Set();
    let selectedHeader = '';
    let showDropdown = false;
    let showProcessButton = false;
    let statusMessage = 'Upload CSV-fil fra Turis';
    let progress = 0;
    let processing = false; // Angiver om vi er i gang med at behandle

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
        const price = parseFloat(value);

        if (Number.isInteger(price)) {
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',-';
        } else {
            return price
                .toFixed(2)
                .replace('.', ',')
                .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
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

    async function handleDescription(description) {
        try {
            const res = await fetch('/api/description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description
                })
            });

            const data = await res.json();
            return data.reply;
        } catch (error) {
            console.error("Fejl i håndtering af beskrivelse:", error);
            return "Fejl i behandling af beskrivelse.";
        }
    }

    async function processCSV() {
        statusMessage = 'Behandler CSV...';

        if (!selectedHeader) {
            alert('Vælg venligst en priskolonne.');
            return;
        }

        let filteredRows = [];
        let processedRows = [];
        processing = true; // Start behandlingsprocessen
        progress = 0; // Sæt progress til 0

        // Trin 1: Filtrer alle rækker, der opfylder kriterierne
        for (let i = 0; i < rows.length; i++) {
            statusMessage = `Filtrerer ${i + 1} ud af ${rows.length}`;
            let row = rows[i];
            let priceValue = row[selectedHeader] ? row[selectedHeader].trim() : null;
            const variantValue = row['Variant'] ? row['Variant'].trim() : null;

            if (priceValue && variantValue && !uniqueVariants.has(variantValue)) {
                priceValue = formatPrice(priceValue);
                uniqueVariants.add(variantValue);

                // Push de nødvendige data til filtreret array
                filteredRows.push({
                    Name: row['Name'],
                    Brand: row['Brand'],
                    SKU: row['SKU'],
                    Price: priceValue,
                    Description: row['Description'],
                    Images: row['Images']
                });
            }

            // Opdater progress efter filtrering
            // progress = ((i + 1) / rows.length) * 50; // Filtrering udgør 50% af processen
        }

        // Trin 2: Behandl titler og beskrivelser efter filtreringen
        for (let i = 0; i < filteredRows.length; i++) {
            statusMessage = `Behandler beskrivelse ${i + 1} ud af ${filteredRows.length}`;
            let row = filteredRows[i];

            // Behandl beskrivelsen med ChatGPT, vent på svaret
            const processedDescription = await handleDescription(row.Description);

            const processedRow = {
                Name: handleTitles(row.Name),
                Brand: row.Brand,
                SKU: row.SKU,
                Price: row.Price,
                Description: processedDescription, // ChatGPT's svar
                Images: handleImages(row.Images)
            };

            processedRows.push(processedRow);

            // Opdater progress efter behandling af titler og beskrivelser
            progress = ((i + 1) / filteredRows.length) * 100; // Behandling af titler udgør de resterende 50%
        }

        // Når alle rækker er behandlet, download CSV
        downloadCSV(processedRows);
        processing = false; // Slut behandlingsprocessen
        statusMessage = 'Filtreret CSV-fil er nu klar til download!';
    }

    function handleImages(images) {
        const imageArray = images.split('|');
        return imageArray[0];
    }

    function handleTitles(title) {
        return title.replace(/\s*\[.*$/, '');
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
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h1 class="text-3xl font-bold text-center mb-5">Turis til Canva</h1>
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

        
        {#if processing}

        <!-- Progress bar -->
        <div class="my-4">
            <p class="italic">Chatter med ChatGPT...</p>
            <div class="w-full bg-gray-200 rounded-full">
                <div class="bg-blue-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all duration-500 ease-in-out" style="width: {progress}%">
                    {progress.toFixed(0)}%
                </div>
            </div>
        </div>
        {/if}

        <!-- Generer CSV knap -->
        {#if showDropdown}
            <button class="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600" on:click={processCSV} disabled={processing}>
                {processing ? 'Behandler...' : 'Generer CSV'}
            </button>
        {/if}
    </div>

    <p id="statusMessage" class="text-center mt-5">{statusMessage}</p>
</div>