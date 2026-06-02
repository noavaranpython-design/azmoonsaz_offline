const router = {
    navigate: function(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('page-' + pageId).classList.add('active');
    }
};
