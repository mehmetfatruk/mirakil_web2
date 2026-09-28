// Ticket flow ported verbatim from the legacy destek.html (only the credentials are injected).
const SUPABASE_URL = window.MIRAKIL_SUPABASE.url;
    const SUPABASE_ANON_KEY = window.MIRAKIL_SUPABASE.anonKey;

    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    // Current ticket tracking state
    let currentTicketEmail = '';
    let currentTicketNumber = '';
    let currentTicketStatus = '';

    /* ===== TAB SWITCHING ===== */
    function switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        if (tab === 'new-ticket') {
            document.querySelectorAll('.tab-btn')[0].classList.add('active');
            document.getElementById('tab-new-ticket').classList.add('active');
        } else {
            document.querySelectorAll('.tab-btn')[1].classList.add('active');
            document.getElementById('tab-track-ticket').classList.add('active');
        }
    }

    /* ===== ALERTS ===== */
    function showAlert(containerId, type, message) {
        const alert = document.getElementById(containerId);
        alert.className = 'alert alert-' + type + ' visible';
        alert.innerHTML = '<i class="fas fa-' + (type === 'error' ? 'exclamation-circle' : 'check-circle') + '"></i> ' + message;
    }

    function hideAlert(containerId) {
        const alert = document.getElementById(containerId);
        alert.className = 'alert';
        alert.innerHTML = '';
    }

    /* ===== SUBMIT NEW TICKET ===== */
    async function submitTicket(e) {
        e.preventDefault();
        hideAlert('new-ticket-alert');

        const btn = document.getElementById('submitTicketBtn');
        btn.classList.add('loading');
        btn.disabled = true;

        const body = {
            name: document.getElementById('ticket-name').value.trim(),
            email: document.getElementById('ticket-email').value.trim(),
            phone: document.getElementById('ticket-phone').value.trim() || null,
            product: document.getElementById('ticket-product').value,
            subject: document.getElementById('ticket-subject').value.trim(),
            description: document.getElementById('ticket-description').value.trim(),
            ticket_number: null
        };

        try {
            const res = await fetch(SUPABASE_URL + '/rest/v1/tickets', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }

            const data = await res.json();
            const ticket = Array.isArray(data) ? data[0] : data;
            const ticketNumber = ticket.ticket_number;

            // Show success modal
            document.getElementById('modal-ticket-number').textContent = ticketNumber;
            document.getElementById('successModal').classList.add('visible');

            // Send email notification via Edge Function
            try {
                await fetch(SUPABASE_URL + '/functions/v1/send-ticket-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
                    body: JSON.stringify({
                        type: 'new_ticket',
                        ticket_number: ticketNumber,
                        customer_name: body.name,
                        customer_email: body.email,
                        subject: body.subject,
                        description: body.description
                    })
                });
            } catch(emailErr) { /* email is best-effort */ }

            // Store for potential tracking
            currentTicketEmail = body.email;
            currentTicketNumber = ticketNumber;

            // Reset form
            document.getElementById('newTicketForm').reset();

        } catch (err) {
            showAlert('new-ticket-alert', 'error', err.message);
        } finally {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    /* ===== MODAL ===== */
    function closeModal() {
        document.getElementById('successModal').classList.remove('visible');
    }

    function goToTrackFromModal() {
        closeModal();
        switchTab('track-ticket');
        document.getElementById('track-email').value = currentTicketEmail;
        document.getElementById('track-number').value = currentTicketNumber;
    }

    /* ===== TRACK TICKET ===== */
    async function trackTicket(e) {
        e.preventDefault();
        hideAlert('track-ticket-alert');

        const btn = document.getElementById('trackTicketBtn');
        btn.classList.add('loading');
        btn.disabled = true;

        const email = document.getElementById('track-email').value.trim();
        const ticketNumber = document.getElementById('track-number').value.trim();

        try {
            const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_ticket', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    p_email: email,
                    p_ticket_number: ticketNumber
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Ticket bulunamadı. Bilgilerinizi kontrol edin.');
            }

            const data = await res.json();
            const ticket = Array.isArray(data) ? data[0] : data;

            if (!ticket || (Array.isArray(data) && data.length === 0)) {
                throw new Error('Bu bilgilerle eşleşen bir ticket bulunamadı.');
            }

            // Store state
            currentTicketEmail = email;
            currentTicketNumber = ticketNumber;
            currentTicketStatus = ticket.status;

            // Render ticket detail
            renderTicketDetail(ticket);

            // Fetch replies
            await loadReplies();

        } catch (err) {
            showAlert('track-ticket-alert', 'error', err.message);
        } finally {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    /* ===== RENDER TICKET DETAIL ===== */
    function renderTicketDetail(ticket) {
        document.getElementById('detail-ticket-number').textContent = ticket.ticket_number;
        document.getElementById('detail-subject').textContent = ticket.subject;
        document.getElementById('detail-product').textContent = ticket.product || '-';

        // Format date
        const date = new Date(ticket.created_at);
        document.getElementById('detail-date').textContent = date.toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Status badge
        const statusEl = document.getElementById('detail-status');
        const statusLabels = {
            'open': 'Açık',
            'in_progress': 'İşlemde',
            'closed': 'Kapatıldı',
            'resolved': 'Çözüldü'
        };
        statusEl.className = 'status-badge status-' + ticket.status;
        statusEl.textContent = statusLabels[ticket.status] || ticket.status;

        // Show/hide close button
        const closeBtn = document.getElementById('closeTicketBtn');
        if (ticket.status === 'closed') {
            closeBtn.style.display = 'none';
            document.getElementById('reply-form-container').querySelector('h4').innerHTML = '<i class="fas fa-lock"></i> Bu ticket kapatılmıştır';
            document.getElementById('reply-message').disabled = true;
            document.getElementById('reply-message').placeholder = 'Kapatılmış ticketlara yanıt gönderilemez.';
            document.getElementById('replyBtn').disabled = true;
            document.getElementById('replyBtn').style.display = 'none';
        } else {
            closeBtn.style.display = 'flex';
            document.getElementById('reply-form-container').querySelector('h4').innerHTML = '<i class="fas fa-reply"></i> Yanıt Yaz';
            document.getElementById('reply-message').disabled = false;
            document.getElementById('reply-message').placeholder = 'Yanıtınızı buraya yazın...';
            document.getElementById('replyBtn').disabled = false;
            document.getElementById('replyBtn').style.display = 'flex';
        }

        // Show detail view, hide form
        document.getElementById('track-form-view').style.display = 'none';
        document.getElementById('ticket-detail-view').classList.add('visible');
    }

    /* ===== LOAD REPLIES ===== */
    async function loadReplies() {
        const repliesList = document.getElementById('replies-list');
        repliesList.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-light);"><i class="fas fa-spinner fa-spin" style="font-size:1.5rem;"></i></div>';

        try {
            const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_ticket_replies', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    p_email: currentTicketEmail,
                    p_ticket_number: currentTicketNumber
                })
            });

            if (!res.ok) throw new Error('Yanıtlar yüklenemedi.');

            const replies = await res.json();

            if (!replies || replies.length === 0) {
                repliesList.innerHTML = '<div class="no-replies"><i class="fas fa-comment-slash"></i>Henüz yanıt bulunmamaktadır.</div>';
                return;
            }

            repliesList.innerHTML = '';
            replies.forEach(reply => {
                const isAdmin = reply.is_admin || reply.author_type === 'admin';
                const date = new Date(reply.created_at);
                const formattedDate = date.toLocaleDateString('tr-TR', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                const authorName = isAdmin ? 'MirAkıl Destek' : (reply.author_name || 'Siz');
                const initials = authorName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

                const replyHTML = `
                    <div class="reply-item ${isAdmin ? 'reply-admin' : 'reply-customer'}">
                        <div class="reply-header">
                            <div class="reply-author">
                                <div class="reply-avatar">${initials}</div>
                                <div>
                                    <div class="reply-author-name">${escapeHtml(authorName)}</div>
                                    ${isAdmin ? '<span class="reply-admin-label"><i class="fas fa-shield-alt"></i> MirAkıl Destek</span>' : ''}
                                </div>
                            </div>
                            <span class="reply-date">${formattedDate}</span>
                        </div>
                        <div class="reply-message">${escapeHtml(reply.message)}</div>
                    </div>
                `;
                repliesList.innerHTML += replyHTML;
            });

        } catch (err) {
            repliesList.innerHTML = '<div class="no-replies"><i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i>' + err.message + '</div>';
        }
    }

    /* ===== SEND REPLY ===== */
    async function sendReply() {
        const message = document.getElementById('reply-message').value.trim();
        if (!message) return;

        const btn = document.getElementById('replyBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';

        try {
            const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/customer_reply', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    p_email: currentTicketEmail,
                    p_ticket_number: currentTicketNumber,
                    p_message: message
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Yanıt gönderilemedi.');
            }

            document.getElementById('reply-message').value = '';
            await loadReplies();

        } catch (err) {
            alert(err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Yanıt Gönder';
        }
    }

    /* ===== CLOSE TICKET ===== */
    async function closeTicket() {
        if (!confirm('Bu ticket\'ı kapatmak istediğinize emin misiniz?')) return;

        const btn = document.getElementById('closeTicketBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kapatılıyor...';

        try {
            const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/customer_close_ticket', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    p_email: currentTicketEmail,
                    p_ticket_number: currentTicketNumber
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Ticket kapatılamadı.');
            }

            // Refresh ticket view
            currentTicketStatus = 'closed';
            const statusEl = document.getElementById('detail-status');
            statusEl.className = 'status-badge status-closed';
            statusEl.textContent = 'Kapatıldı';

            // Hide close button and disable reply
            btn.style.display = 'none';
            document.getElementById('reply-form-container').querySelector('h4').innerHTML = '<i class="fas fa-lock"></i> Bu ticket kapatılmıştır';
            document.getElementById('reply-message').disabled = true;
            document.getElementById('reply-message').placeholder = 'Kapatılmış ticketlara yanıt gönderilemez.';
            document.getElementById('replyBtn').disabled = true;
            document.getElementById('replyBtn').style.display = 'none';

            await loadReplies();

        } catch (err) {
            alert(err.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-times-circle"></i> Ticket\'ı Kapat';
        }
    }

    /* ===== SHOW TRACK FORM ===== */
    function showTrackForm() {
        document.getElementById('track-form-view').style.display = 'block';
        document.getElementById('ticket-detail-view').classList.remove('visible');
        hideAlert('track-ticket-alert');
    }

    /* ===== UTILITY ===== */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ===== URL PARAMS (deep linking) ===== */
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('tab') === 'track') {
            switchTab('track-ticket');
            if (params.get('email')) {
                document.getElementById('track-email').value = params.get('email');
            }
            if (params.get('ticket')) {
                document.getElementById('track-number').value = params.get('ticket');
            }
        }
    });
