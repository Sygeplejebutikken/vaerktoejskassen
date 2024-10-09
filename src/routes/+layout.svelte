<script>
    export const prerender = true;
    import "../app.css";
</script>

<header class="bg-blue-600 text-white py-4 shadow-md">
    <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold">Mathias' Store Værktøjskasse</h1>
        <nav>
            <ul class="flex space-x-4 mt-2">
                <li><a href="./" class="hover:underline">Oversigt</a></li>
                <!-- Tilføj flere menupunkter hvis nødvendigt -->
            </ul>
        </nav>
    </div>
</header>

<main class="flex-grow container mx-auto px-4 py-8">
    <slot />
</main>

<footer class="bg-gray-800 text-white py-4 mt-8">
    <div class="container mx-auto px-4 text-center">
        <p>Lavet med kærlighed og sodavand ❤</p>
    </div>
</footer>

<style>
    /* Sørg for, at footeren bliver på bunden af skærmen, når indholdet er kort */
    :global(body) {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    main {
        flex-grow: 1;
    }
</style>