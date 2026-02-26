<template>
    <div class="searchbar-box">
      <h1 class="searchbar-title">Recherche par titre</h1>
    </div>
  <div class="container-main">
    <div class="card mt-4 mb-4" style="width: 60rem">
      <div class="card-body">
        <!-- Interface -->
        <div class="card-body d-flex flex-row">
          <h4 class="fw-bold" style="color: #006485">Interface de recherche</h4>
          <div>
            <p>Sur l'interface de recherche par titre, vous pouvez :</p>
            <ul>
              <li>
                Saisir le titre de la partition que vous recherchez dans la barre de recherche.
                <br />Vous pouvez également utiliser des mots-clés ou des parties du titre pour affiner votre recherche.
              </li>
              <br />
              <li>
                Utiliser les filtres pour affiner les résultats en fonction de critères tels que le compositeur, le genre musical, ou la période historique.
              </li>
            </ul>
            <br />
            <p>
                <em>Note : la recherche par titre est plus efficace lorsque vous avez une idée précise du titre de la partition que vous recherchez. Si vous n'êtes pas sûr du titre exact, la recherche par motif peut être une meilleure option.</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'SearchByTitleView',
});
</script>

<style scoped></style>
