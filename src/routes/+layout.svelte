<script>
    import "../app.css";
</script>

<body class="min-h-screen">
    <nav class="bg-white shadow-md py-4">
        <div class="container mx-auto">
            <a href="/" class="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300">Hjem</a>
        </div>
    </nav>
    
    <slot />
    
    <footer class="bg-gray-800 text-white py-6 mt-8 bottom-0">
        <div class="container mx-auto text-center">
            <p>&copy; 2024 Mathias' Store Værktøjskasse</p>
        </div>
    </footer>
</body>