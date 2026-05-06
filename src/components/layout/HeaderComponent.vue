<template>
  <nav class="navbar navbar-expand-lg navbar-light border-bottom shadow">
    <div class="container-fluid">
      <a class="navbar-brand text-white" href="/">La plateforme SKRID</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/">SKRID</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/plus">En savoir plus</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/references">Références</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/collections">Collections</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/searchinterface">Recherche par motif</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/contourinterface">Recherche par contour</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineOptions({
  name: 'HeaderComponent',
});
</script>

<style scoped>
.navbar-nav,
.navbar-brand {
  font-size: 18px;
}
</style>
