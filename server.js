<%- include('../partials/head', {title: 'Ma Progression'}) %>
<body>
<div class="app-wrapper">
  <%- include('../partials/sidebar-student', {activePage: 'progress', user, unreadMessages: 0}) %>
  <div class="main-content">
    <div class="topbar">
      <div class="topbar-title">
        <h1>📈 Ma Progression</h1>
        <p>Suivez votre parcours numérique</p>
      </div>
    </div>
    <div class="page-content">
      <!-- Level Card -->
      <div class="card" style="margin-bottom:28px;background:linear-gradient(135deg,var(--navy) 0%,var(--navy-light) 100%);color:white">
        <div class="grid-4">
          <div style="text-align:center">
            <div style="font-size:3rem"><%= user.badge_icon %></div>
            <div style="font-weight:800;font-size:1.3rem"><%= user.level_name %></div>
            <div style="opacity:0.7;font-size:0.85rem">Mon niveau actuel</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:2rem;font-weight:900;color:var(--gold)"><%= user.total_points %></div>
            <div style="font-weight:700">Points totaux</div>
            <div style="opacity:0.7;font-size:0.85rem">Accumulés</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:2rem;font-weight:900;color:var(--teal)"><%= progress.filter(p=>p.is_completed).length %></div>
            <div style="font-weight:700">Cours terminés</div>
            <div style="opacity:0.7;font-size:0.85rem">sur <%= progress.length %> démarrés</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:2rem;font-weight:900;color:var(--coral)"><%= badges.length %></div>
            <div style="font-weight:700">Badges</div>
            <div style="opacity:0.7;font-size:0.85rem">Récompenses</div>
          </div>
        </div>
        <% if (nextLevel) { %>
        <div style="margin-top:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.85rem;opacity:0.85">
            <span>Progression vers "<%= nextLevel.name %>" <%= nextLevel.badge_icon %></span>
            <span><%= user.total_points %>/<%= nextLevel.min_points %> pts</span>
          </div>
          <div style="background:rgba(255,255,255,0.2);border-radius:999px;height:10px;overflow:hidden">
            <div style="width:<%= Math.min(100, Math.round(user.total_points/nextLevel.min_points*100)) %>%;background:var(--gold);height:100%;border-radius:999px"></div>
          </div>
        </div>
        <% } %>
      </div>

      <div class="grid-2">
        <!-- Course Progress -->
        <div class="card">
          <h3 style="margin-bottom:20px">📚 Progression par cours</h3>
          <% if (progress.length === 0) { %>
          <p style="color:var(--muted);text-align:center">Commencez un cours pour voir votre progression !</p>
          <% } else { %>
          <% progress.forEach(p => { %>
          <% const pct = p.total_points > 0 ? Math.round(p.points_earned/p.total_points*100) : 0; %>
          <div style="margin-bottom:16px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <div>
                <div style="font-weight:700;font-size:0.9rem"><%= p.name %></div>
                <div style="font-size:0.75rem;color:var(--muted)"><%= p.icon %> <%= p.module_name %></div>
              </div>
              <% if (p.is_completed) { %>
              <span class="badge-pill badge-success">✅ Terminé</span>
              <% } else { %>
              <span class="badge-pill badge-info"><%= pct %>%</span>
              <% } %>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:<%= pct %>%;background:<%= p.module_color || 'var(--navy)' %>"></div>
            </div>
            <div style="font-size:0.75rem;color:var(--muted);margin-top:4px"><%= p.exercises_completed %> exercices • <%= p.points_earned %> pts</div>
          </div>
          <% }) %>
          <% } %>
        </div>

        <!-- Badges -->
        <div class="card">
          <h3 style="margin-bottom:20px">🏅 Mes Badges</h3>
          <% if (badges.length === 0) { %>
          <div style="text-align:center;padding:20px;color:var(--muted)">
            <div style="font-size:2.5rem">🎯</div>
            <p>Complétez des exercices pour gagner vos premiers badges !</p>
          </div>
          <% } else { %>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <% badges.forEach(b => { %>
            <div style="background:var(--bg);border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:2rem;margin-bottom:6px"><%= b.icon %></div>
              <div style="font-weight:700;font-size:0.85rem"><%= b.name %></div>
              <div style="font-size:0.75rem;color:var(--muted)"><%= b.description %></div>
            </div>
            <% }) %>
          </div>
          <% } %>
        </div>
      </div>

      <!-- History -->
      <div class="card" style="margin-top:24px">
        <h3 style="margin-bottom:20px">📋 Historique des exercices</h3>
        <% if (history.length === 0) { %>
        <p style="color:var(--muted);text-align:center">Aucun exercice complété pour l'instant.</p>
        <% } else { %>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Exercice</th>
                <th>Cours</th>
                <th>Résultat</th>
                <th>Points</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <% history.forEach(h => { %>
              <tr>
                <td style="font-weight:600"><%= h.title %></td>
                <td style="color:var(--muted)"><%= h.course_name %></td>
                <td><span class="badge-pill <%= h.is_correct ? 'badge-success' : 'badge-danger' %>"><%= h.is_correct ? '✅ Réussi' : '❌ Raté' %></span></td>
                <td style="font-weight:800;color:var(--gold)">+<%= h.points_earned %>/<%= h.points %></td>
                <td style="color:var(--muted);font-size:0.85rem"><%= new Date(h.completed_at).toLocaleDateString('fr-BE') %></td>
              </tr>
              <% }) %>
            </tbody>
          </table>
        </div>
        <% } %>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/scripts') %>
</body>
</html>
