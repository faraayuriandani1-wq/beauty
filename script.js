document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navList.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navList.classList.remove('active');
        });
    });

    // Fade-in Animation on Scroll
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // --- SALES HISTORY LOGIC ---
    function saveOrder(order) {
        let orders = JSON.parse(localStorage.getItem('weddingOrders')) || [];
        orders.push(order);
        localStorage.setItem('weddingOrders', JSON.stringify(orders));
        renderHistory();
    }

    function renderHistory() {
        const historyBody = document.getElementById('historyTableBody');
        const orders = JSON.parse(localStorage.getItem('weddingOrders')) || [];

        historyBody.innerHTML = '';

        if (orders.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada data penjualan</td></tr>';
            return;
        }

        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.date}</td>
                <td>${order.name}</td>
                <td>${order.item}</td>
                <td>${order.contact}</td>
                <td><button onclick="deleteOrder(${index})" class="btn-delete">Hapus</button></td>
            `;
            historyBody.innerHTML += row.outerHTML; // Helper to append
        });
    }

    // Expose delete function to global window so HTML onclick works
    window.deleteOrder = function (index) {
        if (confirm('Hapus data ini?')) {
            let orders = JSON.parse(localStorage.getItem('weddingOrders')) || [];
            orders.splice(index, 1);
            localStorage.setItem('weddingOrders', JSON.stringify(orders));
            renderHistory();
        }
    };

    window.clearAllHistory = function () {
        if (confirm('Yakin ingin menghapus SEMUA histori?')) {
            localStorage.removeItem('weddingOrders');
            renderHistory();
        }
    };

    // --- TESTIMONIAL LOGIC ---
    const defaultTestimonials = [
        { name: 'Siti Aminah', rating: 5, text: 'Gaunnya sangat cantik dan pas di badan! Pelayanan sangat ramah.' },
        { name: 'Budi Santoso', rating: 5, text: 'Istri saya sangat suka dengan gaun custom-nya. Terima kasih Salon!' },
        { name: 'Rina Marlina', rating: 4, text: 'Kualitas bahan premium, sedikit perbaikan di ukuran tapi hasilnya memuaskan.' }
    ];

    function saveTestimonial(review) {
        let reviews = JSON.parse(localStorage.getItem('weddingReviews')) || defaultTestimonials;
        reviews.unshift(review); // Add new review to top
        localStorage.setItem('weddingReviews', JSON.stringify(reviews));
        renderTestimonials();
    }

    function renderTestimonials() {
        const container = document.getElementById('testimonialContainer');
        let reviews = JSON.parse(localStorage.getItem('weddingReviews'));

        if (!reviews) {
            reviews = defaultTestimonials;
            localStorage.setItem('weddingReviews', JSON.stringify(reviews));
        }

        container.innerHTML = '';
        reviews.forEach(review => {
            let stars = '⭐'.repeat(review.rating);
            const card = document.createElement('div');
            card.className = 'testimonial-card fade-in';
            card.innerHTML = `
                <div class="stars">${stars}</div>
                <p class="testimonial-text">"${review.text}"</p>
                <p class="client-name">- ${review.name}</p>
            `;
            container.appendChild(card);
        });

        // Re-trigger observer for new elements
        const newElements = document.querySelectorAll('.testimonial-card');
        newElements.forEach(el => observer.observe(el));
    }

    // Handle Testimonial Form
    document.getElementById('testimonialForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewName').value;
        const rating = document.getElementById('reviewRating').value;
        const text = document.getElementById('reviewText').value;

        const newReview = { name, rating: parseInt(rating), text };
        saveTestimonial(newReview);

        alert('Terima kasih atas ulasan Anda!');
        e.target.reset();
    });


    // --- MODIFY EXISTING FORM HANDLERS ---

    // Custom Request Form
    const form = document.getElementById('customForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;

        const phone = document.getElementById('whatsapp').value;
        const description = document.getElementById('description').value;

        // Save to History
        const newOrder = {
            date: new Date().toLocaleDateString('id-ID'),
            name: name,
            item: description.substring(0, 50) + '...', // Shorten desc
            contact: phone
        };
        saveOrder(newOrder);

        // WA Logic
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        const message = `
Halo Salon Beauty & Spa,
Saya ingin request custom pakaian.

*Data Diri:*
Nama: ${name}
WhatsApp: ${phone}

*Detail Request:*
${description}
        `.trim();

        const encodedMessage = encodeURIComponent(message);
        const tokoPhone = '6283131032171';
        const waUrl = `https://wa.me/${tokoPhone}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');

        form.reset();
    });

    // Modal Logic
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-modal');

    // Elements inside modal
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    const modalWaLink = document.getElementById('modalWaLink');

    // Fungsi membuka modal (Global scope agar bisa dipanggil di HTML onclick)
    window.openModal = function (title, price, desc, imgSrc) {
        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        modalTitle.innerText = title;
        modalPrice.innerText = price;
        modalDesc.innerText = desc;

        // When user clicks "Pesan Sekarang" in modal, we can track it loosely here?
        // Or just modify the link. For now, let's just track the "View" or maybe manual add isn't needed here.
        // Let's modify the onclick of the modal button to save history if clicked.

        modalWaLink.onclick = function () {
            saveOrder({
                date: new Date().toLocaleDateString('id-ID'),
                name: 'Guest User',
                item: `Tertarik: ${title}`,
                contact: '-'
            });
        };

        // Buat link pesan spesifik produk
        const message = `Halo, saya tertarik dengan produk *${title}* seharga ${price}. Bisakah saya mendapatkan info lebih lanjut?`;
        modalWaLink.href = `https://wa.me/6283131032171?text=${encodeURIComponent(message)}`;
    };

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Initial Load
    renderHistory();
    renderTestimonials();
});
