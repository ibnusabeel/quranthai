<script>
// Auto-detect and style Arabic text in content
    function styleArabicText() {
    // Arabic Unicode range: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;

    // Get all paragraphs in content areas
    const contentAreas = document.querySelectorAll('.content-body, .tafsir-content');
    
    contentAreas.forEach(area => {
        const paragraphs = area.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            // Check if paragraph contains Arabic characters
            if (arabicRegex.test(p.textContent)) {
        // Add Arabic text class
        p.classList.add('arabic-text');
            }
        });
    });
}

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', styleArabicText);
} else {
        styleArabicText();
}
</script>
