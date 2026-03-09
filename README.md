<body>
      <div class="topbar-title"><h1>⚙️ Paramètres du compte</h1></div>
      <div class="card">
        <h3 style="margin-bottom:24px">👤 Informations personnelles</h3>
        <form method="POST" action="/student/settings">
          <div class="grid-2" style="gap:16px">
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input type="text" name="first_name" class="form-control" value="<%= user.first_name %>">
            </div>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input type="text" name="last_name" class="form-control" value="<%= user.last_name || '' %>">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Identifiant</label>
            <input type="text" class="form-control" value="<%= user.username %>" disabled style="opacity:0.6">
            <small style="color:var(--muted)">L'identifiant ne peut pas être modifié.</small>
          </div>
          <div class="form-group">
            <label class="form-label">Lieu de cours</label>
            <input type="text" class="form-control" value="<%= user.location || '' %>" disabled style="opacity:0.6">
          </div>
          <hr style="margin:24px 0;border:none;border-top:1px solid var(--border)">
          <h3 style="margin-bottom:16px">🔒 Changer le mot de passe</h3>
          <div class="form-group">
            <label class="form-label">Nouveau mot de passe</label>
            <input type="password" name="password" class="form-control" placeholder="Laisser vide pour ne pas changer">
          </div>
          <div class="form-group">
            <label class="form-label">Confirmer le mot de passe</label>
            <input type="password" name="confirm_password" class="form-control" placeholder="Répétez le nouveau mot de passe">
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/scripts') %>
</body>
</html>
