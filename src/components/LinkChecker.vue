<template>
  <div>
    <div class="columns">
      <div class="column">
        <h1
          class="is-size-1 has-text-centered has-text-primary has-margin-top-2"
        >
          Link checker.
        </h1>
      </div>
    </div>
    <div class="columns">
      <div class="column is-three-fifths is-offset-one-fifth">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Url :</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control is-expanded has-icons-left">
                <input
                  class="input is-success is-rounded"
                  type="text"
                  placeholder="Text input"
                  v-model="url"
                />
                <span class="icon is-small is-left">
                  <i class="fas fa-globe-americas"></i>
                </span>
              </div>
            </div>
            <div class="control">
              <button
                @click="checkLinks"
                class="button is-rounded is-inverted is-pulled-right"
                :class="{ 'is-loading': isLoading }"
              >
                Check Links
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-three-fifths is-offset-one-fifth">
        <p class="has-text-centered">
          Total posts checked: {{ totalPosts }} | Links found:
          {{ postLinks.length }}
        </p>
      </div>
    </div>

    <div class="columns is-centered">
      <div class="column is-three-quarters">
        <transition name="slide-fade">
          <tabs v-if="done == true" :options="{ useUrlFragment: false }">
            <transition name="slide-fade">
              <tab name="Posts">
                <p class="is-size-3">Posts with insecure links</p>
                <div
                  class="found-link"
                  v-for="(item, index) in postLinks"
                  :key="index"
                >
                  <a :href="item.url">
                    {{ item.title }}
                  </a>
                  <p>Link: {{ item.link }}</p>
                </div>
              </tab>
            </transition>
            <tab name="Pages">
              Coming Soon
            </tab>
            <tab name="Images">
              Coming Soon
            </tab>
          </tabs>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LinkChecker",
  components: {},
  data() {
    return {
      foundPages: ["none"],
      data: "",
      url: "https://test2.woo360.fun",
      post_pagination: 0,
      isLoading: false,
      instFound: [],
      totalPosts: 0,
      postLinks: [],
      initialTab: "posts",
      tabs: ["posts", "pages", "images"],
      done: false
    };
  },
  props: {
    msg: String
  },
  computed: {},
  methods: {
    reset() {
      this.data = "";
      this.post_pagination = 0;
      this.isLoading = false;
      this.instFound = [];
      this.totalPosts = 0;
      this.postLinks = [];
      this.done = false;
    },
    checkLinks() {
      console.log("Checking Links");
      console.log(window.location.href);
      this.reset();
      this.isLoading = true;
      this.fetchPosts(this.post_pagination);
    },
    fetchPosts(i) {
      const baseURI =
        this.url + "/wp-json/wp/v2/posts/?per_page=10&offset=" + i * 10;
      this.$http.get(baseURI).then(result => {
        console.log(result);
        this.parseData(result.data);
      });
    },
    parseData(data) {
      if (data.length > 0) {
        this.totalPosts += data.length;
        for (let i = 0; i < data.length; i++) {
          // console.log(data[i].content.rendered);
          const source = data[i].content.rendered;
          const parser = new DOMParser();
          const doc = parser.parseFromString(source, "text/html");
          this.parseAnchors(doc, data[i]);
          var found = (source.match(/http:/g) || []).length;
          if (found > 0) {
            this.instFound.push(found);
          }
        }
        this.post_pagination += 1;
        this.fetchPosts(this.post_pagination);
      } else {
        this.isLoading = false;
        this.post_pagination = 0;
        this.done = true;
      }
    },
    parseAnchors(doc, item) {
      const links = doc.getElementsByTagName("a");
      console.log(links);
      if (links.length > 0) {
        for (var i = 0; i < links.length; i++) {
          const re = new RegExp(/http:/g);
          let link = links[i].href;
          let currentLocation = window.location.href;
          let isRelative = link.includes(currentLocation);
          if (!isRelative) {
            if (re.test(links[i].href)) {
              this.postLinks.push({
                title: item.title.rendered,
                link: links[i],
                url: item.link
              });
            }
          }
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.found-link {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.tabs-component {
  margin: 4em 0;
}

.tabs-component-tabs {
  border: solid 1px #ddd;
  border-radius: 6px;
  margin-bottom: 5px;
}

@media (min-width: 700px) {
  .tabs-component-tabs {
    border: 0;
    align-items: stretch;
    display: flex;
    justify-content: flex-start;
    margin-bottom: -1px;
  }
}

.tabs-component-tab {
  color: #999;
  font-size: 14px;
  font-weight: 600;
  margin-right: 0;
  list-style: none;
  transition: 0.3s;
}

.tabs-component-tab:hover,
.tabs-component-tab:hover a {
  color: #fff !important;
  background-color: #00a088;
}

.tabs-component-tab.is-active {
  color: #fff;
  background-color: #00d1b2;
}

.tabs-component-tab.is-disabled * {
  color: #cdcdcd;
  cursor: not-allowed !important;
}

@media (min-width: 700px) {
  .tabs-component-tab {
    background-color: #fff;
    border: solid 1px #ddd;
    border-bottom: none;
    border-radius: 3px 3px 0 0;
    margin-right: 0.5em;
    transform: translateY(2px);
    transition: transform 0.3s ease;
  }

  .tabs-component-tab.is-active {
    border-bottom: solid 1px #fff;
    z-index: 2;
    transform: translateY(0);
  }
}

.tabs-component-tab-a {
  align-items: center;
  color: inherit;
  display: flex;
  padding: 0.75em 1em;
  text-decoration: none;
}

.tabs-component-panels {
  padding: 4em 0;
}

@media (min-width: 700px) {
  .tabs-component-panels {
    border-top-left-radius: 0;
    background-color: #fff;
    border: solid 1px #ddd;
    border-radius: 0 6px 6px 6px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    padding: 2em 3em;
  }
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all 0.8s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(40px);
  opacity: 0;
}
</style>
