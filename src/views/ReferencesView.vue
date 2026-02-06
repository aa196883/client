<template>
  <div class="container-main">
    <div class="searchbar-box text-center">
      <h1 class="searchbar-title">Références</h1>
    </div>
    <div class="container mt-5">
      <div class="content-wrapper mt-4">
        <h3 class="text-center">Publications scientifiques liées à la plateforme</h3>
        <div class="jumbotron p-4">
          <ul class="list-unstyled">
            <li>
              <i>
                <a href="https://hal.science/hal-05485122v2" target="_blank"
                  >Where Graphs Meet Fuzzy Logic — A DBMS-Centered Engine for Polyphonic Music Matching in Score Databases</a
                >
              </i>
              <br />
              <span class="text-muted"
                >Adel Aly, Olivier Pivert, Virginie Thion — Proceedings of the International Conference on Extending Database Technology
                (EDBT'2026), Tampere, Finland</span
              >
            </li>
            <li>
              <i>
                <a href="https://hal.science/hal-05050369v1" target="_blank">Fuzzy Retrieval of Musical Scores Based on Melodic Patterns</a>
              </i>
              <br />
              <span class="text-muted"
                >Adel Aly, Olivier Pivert, Virginie Thion — Proceedings of the IEEE International Conference on Fuzzy Systems (FUZZ-IEEE'25),
                Reims, France</span
              >
            </li>
            <li>
              <i>
                <a href="https://hal.science/hal-05011084v1" target="_blank"
                  >A Flexible Framework for Transposition-Aware Querying of a Musical Score Database (Best Paper Award RCIS 2025)</a
                >
              </i>
              <br />
              <span class="text-muted"
                >Adel Aly, Olivier Pivert, Virginie Thion — Proceedings of the Research Challenges in Information Science (RCIS'25), Seville, Spain (Best Paper Award)</span
              >
            </li>
            <li>
              <i>
                <a href="https://hal.science/hal-04904525v1" target="_blank"
                  >Maelis4Skrid: an Approximate Query Engine for an Online Graph-Based Musical Score Library</a
                >
              </i>
              <br />
              <span class="text-muted"
                >Adel Aly, Olivier Pivert, Virginie Thion — Companion Proceedings of the ACM Web Conference 2025 (WWW'25), Sydney, Australia</span
              >
            </li>
            <li>
              <i>
                <a href="https://hal.science/hal-04681804v1" target="_blank"
                  >Database Approaches to the Modelling and Querying of Musical Scores: a Survey</a
                >
              </i>
              <br />
              <span class="text-muted"
                >Adel Aly, Olivier Pivert, Virginie Thion — Proceedings of the International Conference on Theory and Practice of Digital
                Libraries (TPDL'24)</span
              >
            </li>
            <li>
              <i>
                <a href="https://www.sciencedirect.com/science/article/pii/S0169023X24000648" target="_blank"
                  >Topological querying of music scores</a
                >
              </i>
              <br />
              <span class="text-muted">Philippe Rigaux, Virginie Thion — Data &amp; Knowledge Engineering, 153: 102340 (2024)</span>
            </li>
            <li>
              <i>
                <a
                  href="http://www.openscience.fr/Exploration-de-partitions-musicales-modelisees-sous-forme-de-graphe"
                  target="_blank"
                  >Exploration de partitions musicales modélisées sous forme de graphe</a
                >
              </i>
              <br />
              <span class="text-muted"
                >Philippe Rigaux, Virginie Thion — Revue Ouverte d'Ingénierie des systèmes d'information, 4(2), 2024</span
              >
            </li>
            <li>
              <i>Towards a Graph-Oriented Perspective for Querying Music Scores</i>
              <br />
              <span class="text-muted">Philippe Rigaux, Virginie Thion — Proceedings of the INFORSID conference (2022)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReferencesView',
};
</script>

<style scoped>
.container {
  text-align: center;
}

.jumbotron {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.list-unstyled li {
  margin-bottom: 15px;
}

.list-unstyled a {
  font-weight: bold;
  text-decoration: none;
  color: #006485;
}

.list-unstyled a:hover {
  text-decoration: underline;
}
.searchbar-box {
  background-color: rgb(0, 100, 150);
  color: white;
  top: 0;
  padding: 10px;
  transition: opacity 1.5s ease-in-out;
  opacity: 1;
}
</style>
