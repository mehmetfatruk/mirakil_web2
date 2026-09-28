// Admin panel logic ported verbatim from the legacy admin.html (credentials injected).
// ===== CONFIGURATION =====
        const SUPABASE_URL = window.MIRAKIL_SUPABASE.url;
        const SUPABASE_ANON_KEY = window.MIRAKIL_SUPABASE.anonKey;

        const API_HEADERS = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
        };

        // ===== STATE =====
        let allTickets = [];
        let allContacts = [];
        let currentFilter = 'all';
        let currentTicket = null;

        // ===== HELPERS =====
        async function rpc(fnName, body) {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }
            const text = await res.text();
            if (!text) return null;
            try { return JSON.parse(text); } catch { return text; }
        }

        function getPassword() {
            return sessionStorage.getItem('admin_password') || '';
        }

        function formatDate(dateStr) {
            if (!dateStr) return '-';
            const d = new Date(dateStr);
            return d.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function formatDateShort(dateStr) {
            if (!dateStr) return '-';
            const d = new Date(dateStr);
            return d.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        function statusBadge(status) {
            const map = {
                'open': '<span class="badge badge-open">Açık</span>',
                'in_progress': '<span class="badge badge-in_progress">İşlemde</span>',
                'closed': '<span class="badge badge-closed">Kapalı</span>'
            };
            return map[status] || `<span class="badge">${status}</span>`;
        }

        function escapeHtml(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.className = 'toast toast-' + type + ' show';
            toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${escapeHtml(message)}`;
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3500);
        }

        // ===== LOGIN =====
        async function handleLogin(e) {
            e.preventDefault();
            const password = document.getElementById('loginPassword').value.trim();
            const loginBtn = document.getElementById('loginBtn');
            const loginError = document.getElementById('loginError');

            if (!password) return;

            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Doğrulanıyor...';
            loginError.classList.remove('show');

            try {
                const result = await rpc('verify_admin', { p_password: password });
                if (result === true) {
                    sessionStorage.setItem('admin_password', password);
                    showDashboard();
                } else {
                    loginError.classList.add('show');
                }
            } catch (err) {
                loginError.textContent = 'Bağlantı hatası. Lütfen tekrar deneyin.';
                loginError.classList.add('show');
                console.error('Login error:', err);
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
            }
        }

        function handleLogout() {
            sessionStorage.removeItem('admin_password');
            document.getElementById('dashboard').classList.remove('active');
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginError').classList.remove('show');
            allTickets = [];
            allContacts = [];
        }

        function showDashboard() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboard').classList.add('active');
            loadTickets();
            loadContacts();
        }

        // ===== AUTO-LOGIN CHECK =====
        (function checkSession() {
            const pw = sessionStorage.getItem('admin_password');
            if (pw) {
                rpc('verify_admin', { p_password: pw }).then(result => {
                    if (result === true) {
                        showDashboard();
                    } else {
                        sessionStorage.removeItem('admin_password');
                    }
                }).catch(() => {
                    sessionStorage.removeItem('admin_password');
                });
            }
        })();

        // ===== TABS =====
        function switchTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('ticketDetail').classList.remove('active');

            if (tab === 'tickets') {
                document.getElementById('tabBtnTickets').classList.add('active');
                document.getElementById('tabTickets').classList.add('active');
            } else {
                document.getElementById('tabBtnContacts').classList.add('active');
                document.getElementById('tabContacts').classList.add('active');
            }
        }

        // ===== TICKETS =====
        async function loadTickets() {
            const body = document.getElementById('ticketsBody');
            body.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Yükleniyor...</p></div>';

            try {
                const data = await rpc('admin_get_tickets', { p_password: getPassword() });
                allTickets = Array.isArray(data) ? data : [];
                document.getElementById('ticketCount').textContent = allTickets.length;
                renderTickets();
            } catch (err) {
                body.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Veriler yüklenirken hata oluştu.</p></div>';
                console.error('Load tickets error:', err);
            }
        }

        function renderTickets() {
            const body = document.getElementById('ticketsBody');
            let filtered = allTickets;

            if (currentFilter !== 'all') {
                filtered = allTickets.filter(t => t.status === currentFilter);
            }

            if (filtered.length === 0) {
                body.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Gösterilecek destek talebi bulunamadı.</p></div>';
                return;
            }

            body.innerHTML = filtered.map(t => `
                <div class="table-row tickets-grid" onclick="openTicket('${t.id}')" style="cursor:pointer;">
                    <div class="cell-ticket">
                        <span class="mobile-label">Ticket:</span>
                        ${escapeHtml(t.ticket_number || t.id)}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">Ad:</span>
                        ${escapeHtml(t.name)}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">E-posta:</span>
                        ${escapeHtml(t.email)}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">Konu:</span>
                        ${escapeHtml(t.subject)}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">Ürün:</span>
                        ${escapeHtml(t.product || '-')}
                    </div>
                    <div>
                        ${statusBadge(t.status)}
                    </div>
                    <div style="font-size:0.82rem;color:var(--text-light);">
                        <span class="mobile-label">Tarih:</span>
                        ${formatDateShort(t.created_at)}
                    </div>
                </div>
            `).join('');
        }

        function filterTickets(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.filter === filter);
            });
            renderTickets();
        }

        // ===== TICKET DETAIL =====
        async function openTicket(ticketId) {
            const ticket = allTickets.find(t => t.id === ticketId);
            if (!ticket) return;
            currentTicket = ticket;

            // Hide list, show detail
            document.getElementById('tabTickets').classList.remove('active');
            document.getElementById('ticketDetail').classList.add('active');

            // Set title
            document.getElementById('detailTitle').innerHTML = `Ticket <span>${escapeHtml(ticket.ticket_number || ticket.id)}</span>`;

            // Ticket info
            document.getElementById('detailInfo').innerHTML = `
                <div class="ticket-info-grid">
                    <div class="info-item">
                        <label>Ad Soyad</label>
                        <p>${escapeHtml(ticket.name)}</p>
                    </div>
                    <div class="info-item">
                        <label>E-posta</label>
                        <p>${escapeHtml(ticket.email)}</p>
                    </div>
                    <div class="info-item">
                        <label>Konu</label>
                        <p>${escapeHtml(ticket.subject)}</p>
                    </div>
                    <div class="info-item">
                        <label>Ürün</label>
                        <p>${escapeHtml(ticket.product || '-')}</p>
                    </div>
                    <div class="info-item">
                        <label>Durum</label>
                        <p>${statusBadge(ticket.status)}</p>
                    </div>
                    <div class="info-item">
                        <label>Oluşturulma Tarihi</label>
                        <p>${formatDate(ticket.created_at)}</p>
                    </div>
                </div>
                ${ticket.description || ticket.message ? `
                    <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border);">
                        <div class="info-item">
                            <label>Açıklama</label>
                            <p style="font-weight:400;line-height:1.7;white-space:pre-wrap;">${escapeHtml(ticket.description || ticket.message)}</p>
                        </div>
                    </div>
                ` : ''}
            `;

            // Show/hide close button
            const closeBtn = document.getElementById('closeTicketBtn');
            if (ticket.status === 'closed') {
                closeBtn.style.display = 'none';
            } else {
                closeBtn.style.display = 'inline-flex';
            }

            // Load replies
            loadReplies(ticketId);
        }

        async function loadReplies(ticketId) {
            const list = document.getElementById('repliesList');
            list.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Yanıtlar yükleniyor...</p></div>';

            try {
                const data = await rpc('admin_get_ticket_replies', {
                    p_password: getPassword(),
                    p_ticket_id: ticketId
                });
                const replies = Array.isArray(data) ? data : [];

                if (replies.length === 0) {
                    list.innerHTML = '<div class="no-replies"><i class="fas fa-comment-slash"></i>Henüz yanıt bulunmuyor.</div>';
                } else {
                    list.innerHTML = replies.map(r => {
                        const isAdmin = r.is_admin === true || r.sender_type === 'admin';
                        return `
                            <div class="reply-bubble ${isAdmin ? 'reply-admin' : 'reply-customer'}">
                                <div>${escapeHtml(r.message)}</div>
                                <div class="reply-meta">
                                    ${isAdmin ? '<i class="fas fa-user-shield"></i> Admin' : '<i class="fas fa-user"></i> Müşteri'}
                                    &nbsp;·&nbsp; ${formatDate(r.created_at)}
                                </div>
                            </div>
                        `;
                    }).join('');
                    // Scroll to bottom
                    list.scrollTop = list.scrollHeight;
                }
            } catch (err) {
                list.innerHTML = '<div class="no-replies"><i class="fas fa-exclamation-triangle"></i>Yanıtlar yüklenirken hata oluştu.</div>';
                console.error('Load replies error:', err);
            }
        }

        async function sendReply() {
            const message = document.getElementById('replyMessage').value.trim();
            if (!message || !currentTicket) return;

            const btn = document.getElementById('sendReplyBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';

            try {
                await rpc('admin_reply', {
                    p_password: getPassword(),
                    p_ticket_id: currentTicket.id,
                    p_message: message
                });
            } catch (err) {
                showToast('Yanıt gönderilemedi. Lütfen tekrar deneyin.', 'error');
                console.error('Send reply error:', err);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> Yanıt Gönder';
                return;
            }

            // Reply saved successfully
            document.getElementById('replyMessage').value = '';
            showToast('Yanıt başarıyla gönderildi.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Yanıt Gönder';

            // Refresh UI
            loadReplies(currentTicket.id).catch(function(){});
            loadTickets().catch(function(){});

            // Send email notification (fire-and-forget)
            fetch(SUPABASE_URL + '/functions/v1/send-ticket-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
                body: JSON.stringify({
                    type: 'ticket_reply',
                    ticket_number: currentTicket.ticket_number,
                    customer_name: currentTicket.name,
                    customer_email: currentTicket.email,
                    subject: currentTicket.subject,
                    reply_message: message,
                    reply_from: 'MirAkıl Destek'
                })
            }).catch(function(){});
        }

        async function closeTicket() {
            if (!currentTicket) return;
            if (!confirm('Bu ticket\'ı kapatmak istediğinizden emin misiniz?')) return;

            const btn = document.getElementById('closeTicketBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kapatılıyor...';

            try {
                await rpc('admin_close_ticket', {
                    p_password: getPassword(),
                    p_ticket_id: currentTicket.id
                });
                showToast('Ticket başarıyla kapatıldı.');
                currentTicket.status = 'closed';
                btn.style.display = 'none';
                // Refresh ticket info
                openTicket(currentTicket.id);
                loadTickets();
            } catch (err) {
                showToast('Ticket kapatılamadı. Lütfen tekrar deneyin.', 'error');
                console.error('Close ticket error:', err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-times-circle"></i> Ticket\'ı Kapat';
            }
        }

        function backToList() {
            document.getElementById('ticketDetail').classList.remove('active');
            document.getElementById('tabTickets').classList.add('active');
            currentTicket = null;
        }

        // ===== CONTACTS =====
        async function loadContacts() {
            const body = document.getElementById('contactsBody');
            body.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Yükleniyor...</p></div>';

            try {
                const data = await rpc('admin_get_contacts', { p_password: getPassword() });
                allContacts = Array.isArray(data) ? data : [];
                document.getElementById('contactCount').textContent = allContacts.length;
                renderContacts();
            } catch (err) {
                body.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Veriler yüklenirken hata oluştu.</p></div>';
                console.error('Load contacts error:', err);
            }
        }

        function renderContacts() {
            const body = document.getElementById('contactsBody');

            if (allContacts.length === 0) {
                body.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Gösterilecek iletişim formu bulunamadı.</p></div>';
                return;
            }

            body.innerHTML = allContacts.map((c, i) => `
                <div class="table-row contacts-grid" onclick="toggleContact(${i})">
                    <div class="cell-truncate">
                        <span class="mobile-label">Ad:</span>
                        ${escapeHtml(c.name)}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">E-posta:</span>
                        ${escapeHtml(c.email)}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">Telefon:</span>
                        ${escapeHtml(c.phone || '-')}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">Konu:</span>
                        ${escapeHtml(c.subject || '-')}
                    </div>
                    <div class="cell-truncate">
                        <span class="mobile-label">Mesaj:</span>
                        ${escapeHtml((c.message || '').substring(0, 80))}${(c.message || '').length > 80 ? '...' : ''}
                    </div>
                    <div style="font-size:0.82rem;color:var(--text-light);">
                        <span class="mobile-label">Tarih:</span>
                        ${formatDateShort(c.created_at)}
                    </div>
                </div>
                <div class="contact-expand" id="contactExpand${i}">
                    <div class="contact-expand-inner">
                        <h4><i class="fas fa-user"></i> ${escapeHtml(c.name)} - ${escapeHtml(c.subject || 'Konu belirtilmemiş')}</h4>
                        <p style="margin-bottom:10px;"><strong>E-posta:</strong> ${escapeHtml(c.email)} ${c.phone ? '&nbsp;|&nbsp; <strong>Telefon:</strong> ' + escapeHtml(c.phone) : ''}</p>
                        <p style="margin-bottom:6px;"><strong>Tarih:</strong> ${formatDate(c.created_at)}</p>
                        <hr style="border:none;border-top:1px solid var(--border);margin:12px 0;">
                        <h4>Mesaj</h4>
                        <p>${escapeHtml(c.message)}</p>
                    </div>
                </div>
            `).join('');
        }

        function toggleContact(index) {
            const el = document.getElementById('contactExpand' + index);
            if (el) {
                el.classList.toggle('show');
            }
        }
