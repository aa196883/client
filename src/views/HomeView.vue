<template>
  <div class="container-main">
    <!-- Section principale -->

    <div class="project-title">
      <br />
      <h1 class="text-white">SKRID</h1>
      <p></p>
      <a href="#services" class="btn btn-outline btn-lg mt-3" style="background-color: #7ab6e0">En savoir plus</a>
    </div>
    <!-- Section des services -->
    <section id="services" class="services py-5">
      <div class="container">
        <p class="text-center text-muted mb-5">
          La plateforme Skrid est développée et maintenue par le laboratoire IRISA (site de Lannion). Cette plateforme est un
          prototype d&eacute;di&eacute; &agrave; la mise en oeuvre de techniques de recherche de contenu musical
          (d&eacute;velopp&eacute;es par l'IRISA) au sein de partitions musicales de musique traditionnelle bretonne. <br />
          À ce jour, deux collections sont int&eacute;gr&eacute;es &agrave; la plateforme Skrid. Une troisième collection est en
          cours de numérisation.
        </p>
        <hr />
        <br />
        <div class="row g-4">
          <div class="col-12">
            <div class="card card-highlight">
              <div class="card-body">
                <h5 class="card-title text-center">Avant-propos important</h5>
                <p class="card-text text-muted">
                  L'objectif de la plateforme est la mise à disposition de partitions sous une forme numérisée permettant la
                  recherche dans le contenu des partitions et non leur édition. <br /><br />
                  Le processus de conversion utilisé dans la plateforme, permettant de passer de la version originale de la
                  partition à une version de la partition encodant son contenu musical de façon fine, peut conduire à la perte de
                  quelques partitions d'une collection, à l'introduction de quelques erreurs et surtout à la perte de la mise en
                  page des partitions. <br /><br />
                  Les fournisseurs des données que la plateforme remercie grandement pour leur aide, ne sont aucunement
                  responsables des erreurs que le traitement des données pourrait occasionner sur les partitions mises à
                  disposition par la plateforme.
                </p>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title text-center">Recueil Albert Poulain</h5>
                <p class="card-text text-muted">
                  Ces partitions sont issues de l'ouvrage
                  <a href="https://pur-editions.fr/product/668/carnets-de-route" target="_blank">
                    <i>Albert Poulain, Carnets de route, chansons traditionnelles de Haute Bretagne</i>
                  </a>
                  (Éditions Dastum, Presses universitaires de Rennes), publié en 2011. <br /><br />
                  Dastum (<b>Anne-Marie Nicol</b>) a fourni chacune des partitions disponibles au format d'un fichier Finale.
                  <br /><br />
                  Le projet Skrid a exporté les partitions sous forme MusicXML (via la fonctionnalité d'export de Finale). Les
                  partitions ont ensuite été exportée aux formats
                  <a href="https://w3c.github.io/musicxml/" target="_blank">musicXML</a>
                  , PDF, MIDI, SVG via MuseScore. Le format
                  <a href="https://music-encoding.org/" target="_blank">MEI</a>
                  a été obtenu par transcription du fichier musicXML via l'outil
                  <a href="https://www.verovio.org" target="_blank">verovio</a>.
                </p>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title text-center">Recueil François Cadic</h5>
                <p class="card-text text-muted">
                  Ces partitions sont issues de l'ouvrage
                  <a href="https://www.dastum.bzh/article/chansons-populaires-de-bretagne-1899-1929-francois-cadic/" target="_blank">
                    <i>Chansons populaires de Bretagne (1899-1929) - François Cadic</i>
                  </a>
                  (Éditions Dastum, Presses universitaires de Rennes), publié en 2010. <br /><br />
                  Chacun de fichiers encodé a été fourni par le site kan.bzh (<b>Didier Becam</b> et <b>Nolwenn Morvan</b>) au format d'un fichier Finale.
                  <br /><br />
                  Le projet Skrid a exporté les partitions sous forme MusicXML (via la fonctionnalité d'export de Finale). Les
                  partitions ont ensuite été exportée aux formats
                  <a href="https://w3c.github.io/musicxml/" target="_blank">musicXML</a>
                  , PDF, MIDI, SVG via MuseScore. Le format
                  <a href="https://music-encoding.org/" target="_blank">MEI</a>
                  a été obtenu par transcription du fichier musicXML via l'outil
                  <a href="https://www.verovio.org" target="_blank">verovio</a>.
                </p>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title text-center">Recueil Joseph Mahé</h5>
                <p class="card-text text-muted">
                  Origine des partitions. Ces partitions sont issues du manuscrit
                  <a href="https://gallica.bnf.fr/ark:/12148/bpt6k61026071" target="_blank">
                    <i>Essai sur les Antiquit&eacute;s du d&eacute;partement du Morbihan</i>
                  </a>
                  , de Joseph Mahé, publié en 1825, dont une version numérique est mise à disposition dans la Biliothèque
                  <a href="https://gallica.bnf.fr/" target="_blank"> Gallica </a>
                  de la BnF. <br /><br />
                  Ces œuvres sont également étudiées dans l'ouvrage Joseph Mahé (1760-1831) Premier collecteur de musique
                  populaire de Haute et Basse-Bretagne de Roland Becker (Éditions Dastum, Presses universitaires de Rennes),
                  publié en 2017. <br/><br/>

                  Pour chacune des partitions, la partition a été saisie sous
                  <a href="https://www.musescore.com" target="_blank"> MuseScore </a>
                  (.mscz) par <b>Gwenael Piel</b>, et ensuite exportée aux formats
                  <a href="https://w3c.github.io/musicxml/" target="_blank"> musicXML </a>
                  , PDF, MIDI, SVG via MuseScore. <br /><br />
                  Le format
                  <a href="https://music-encoding.org/" target="_blank"> MEI </a>
                  a été obtenu par transcription du fichier musicXML via l'outil
                  <a href="https://www.verovio.org" target="_blank"> verovio. </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineOptions({
  name: 'HomeView',
});
</script>

<style scoped>
.project-title {
  text-align: center;
  color: white;
  padding-bottom: 20px;
  background: rgb(0, 100, 150);
  width: 100%;
}

.services .card {
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.services .card-highlight {
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(0, 100, 150, 0.2);
  background: rgba(122, 182, 224, 0.08);
}

.services .card:hover {
  transform: translateY(-5px);
}

p {
  font-size: 14px;
}
.searchbar-box {
  margin-top: 70px;
  background: linear-gradient(
    to right,
    rgba(0, 100, 133, 1),
    rgba(0, 120, 160, 0.9),
    rgba(0, 100, 155, 0.8),
    rgba(0, 100, 133, 0.7)
  );
  color: black;
}
</style>
