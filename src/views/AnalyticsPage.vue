<script>
import axios from "axios";
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import TheTabularDisplay from "@/components/data-components/TheTabularDisplay.vue";
import TheMapsDisplay from "@/components/data-components/TheMapsDisplay.vue";

export default {
  name: 'AnalyticsPage',
  data() {
    return {
      loadingChart: false,
      mainChartData: null,
      mainGroupBy: null,
      nextGroupBy: null,
      groupbyOptions: {
        "tree_species_type_desc": "Species Type",
        "tree_age_group_desc": "Age",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition",
        "tree_species_desc": "Species",
        "tree_data_quality_desc": "Data Quality",
        "tree_type_desc": "Tree Type"
      },
      quantOptions: {
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "tree_data_quality_id": "Data Quality"
      },
      graphsArray: [],
      filtersObj: {},
      scriptLoaded: false,
      showChart: true,
      rowData: null,
      userLat: null,
      userLong: null,
      groupByDropdownClass: "dropdown",
      ddClicked: false,
      currentDisplay: "chart",
      displayOptions: ["chart", "table", "map", "all"],
      totalData: 0
    }
  },
  watch: {
    mainGroupBy(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.drawChart();
      }
    },
    userLat(newValue) {
      if (newValue) {
        this.drawChart();
      }
    },
    currentDisplay(newValue) {
      if (["all", "chart"].includes(newValue)) {
        this.drawChart();
      }
    }
  },
  computed: {
    validGroupbyOptions() {
      if (Object.keys(this.filtersObj).length === 0) {
        if (!this.mainGroupBy) {
          return this.groupbyOptions;
        } else {
          const filteredObj = Object.entries(this.groupbyOptions).filter(([key]) => key !== this.mainGroupBy);
          return Object.fromEntries(filteredObj)
        }
      }
      const validGroupbys = {}
      for (const currentKey in this.groupbyOptions) {
        if (!Object.keys(this.filtersObj).includes(currentKey) && this.mainGroupBy !== currentKey) {
          validGroupbys[currentKey] = this.groupbyOptions[currentKey];
        }
      }
      return validGroupbys;
    },
    colsToDisplayInTable() {
      const displayCols = {"tree_id": "Tree Number", "tree_distance": "Tree Distance (km)"}
      if (!this.rowData) {
        return displayCols
      }
      displayCols[this.mainGroupBy] = this.groupbyOptions[this.mainGroupBy];
      return displayCols;
    },
    dropdownDisplayVal() {
      let displayVal = "Group By";
      if (this.ddClicked) {
        displayVal = this.groupbyOptions[this.mainGroupBy]
      }
      return displayVal;
    }
  },
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = this.drawChart;
    document.head.appendChild(script);
    this.scrollToDiv();

    navigator.geolocation.getCurrentPosition(
        position => {
          this.userLat = position.coords.latitude;
          this.userLong = position.coords.longitude;
          console.log(this.userLat, this.userLong)
        },
        error => {
          console.log(error.message);
        },)
  },
  methods: {
    updateGroupBy(val) {
      this.switchDropdown();
      this.mainGroupBy = val;
    },
    removeFilter(name) {
      delete this.filtersObj[name];
      this.drawChart();
      if (this.currentDisplay === "chart" || this.currentDisplay === "all") {
        this.scrollToDiv();
      }
    },
    resetToDefault() {
      this.filtersObj = {}
      this.mainGroupBy = null;
      this.ddClicked = false;
    },
    scrollToDiv() {
      this.$refs["chart-div"].scrollIntoView({behavior: 'smooth'});
    },
    switchDropdown() {
      this.ddClicked = true;
      if (this.groupByDropdownClass === "dropdown") {
        this.groupByDropdownClass = "dropdown is-active"
      } else {
        this.groupByDropdownClass = "dropdown"
      }
    },
    async getMainChartData() {
      if (!this.mainGroupBy) {
        this.mainGroupBy = "tree_species_type_desc"
      }
      const groupByField = this.mainGroupBy.replace("_desc", "")

      return axios.post(`${process.env.VUE_APP_API_SERVER_URL}/analytics/group-by-counts/?val_for_groupby=${groupByField}`,
          this.filtersObj)
          .then(response => (this.mainChartData = response.data.group_by_counts))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getTabularDataNoLoc() {
      return axios.post(`${process.env.VUE_APP_API_SERVER_URL}/analytics/row-level-data/?limit=20`,
          this.filtersObj)
          .then(response => (this.rowData = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getTabularDataWithLoc() {
      return axios.post(`${process.env.VUE_APP_API_SERVER_URL}/analytics/row-level-data-loc/?lat=${this.userLat}&long=${this.userLong}&limit=20`,
          this.filtersObj)
          .then(response => (this.rowData = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async drawChart() {
      this.loadingChart = true;
      const newGraphObj = {};
      await this.getMainChartData();
      if (this.userLat && this.userLong) {
        await this.getTabularDataWithLoc()
      } else {
        await this.getTabularDataNoLoc()
      }
      const chartData = [[this.groupbyOptions[this.mainGroupBy], 'Total']];
      this.totalData = 0
      this.mainChartData.forEach(item => {
        if (item[this.mainGroupBy]) {
          this.totalData += item.total;
          chartData.push([item[this.mainGroupBy], item.total]);
        }
      });
      newGraphObj["data"] = chartData;
      let newTitle = `Number of trees by ` + this.groupbyOptions[this.mainGroupBy];
      if (Object.keys(this.filtersObj).length > 0) {
        newTitle += " where"
        Object.entries(this.filtersObj).forEach(([key, value]) => {
          const colName = this.groupbyOptions[key];
          const whereClause = ` ${colName} is '${value}', `
          newTitle += whereClause
        });
        newTitle = newTitle.slice(0, -2);
      }
      newTitle += `\n\nTotal Count: ${this.totalData}`
      newGraphObj["title"] = newTitle;
      newGraphObj["groupby"] = this.mainGroupBy

      window.google.charts.load('current', {'packages': ['corechart']});
      window.google.charts.setOnLoadCallback(() => {
        const data = window.google.visualization.arrayToDataTable(newGraphObj["data"]);


        let chart;
        let height = 400
        if (this.mainChartData.length > 10) {
          chart = new window.google.visualization.BarChart(document.getElementById('chart_div'));
          height = 800
        } else {
          chart = new window.google.visualization.PieChart(document.getElementById('chart_div'));
        }

        const options = {
          title: newGraphObj["title"],
          bar: {groupWidth: "95%"},
          legend: {position: "top"},
          height: height,
          width: 300,
          pieSliceText: "value",
          tooltip: {
            text: "percentage"
          },
          slice: {
            0: {offset: 0.1}
          },
          pieSliceTextStyle: {
            fontSize: 10 // Adjust the font size as needed
          },
          annotations: {
            alwaysOutside: true,
            textStyle: {
              fontSize: 12,
              auraColor: 'none',
              color: '#555'
            }
          }
        };

        chart.draw(data, options);

        window.google.visualization.events.addListener(chart, 'select', () => {
          const selectedItem = chart.getSelection()[0];
          if (selectedItem) {
            const value = data.getValue(selectedItem.row, 0);
            this.filtersObj[this.mainGroupBy] = value;
            this.mainGroupBy = Object.keys(this.validGroupbyOptions)[0];

            console.log("Here is the value selected: " + value)
            this.scrollToDiv();
          }
        });
      });
      this.loadingChart = false;
    },
  }
  ,
  components: {
    ThePageHero,
    TheTabularDisplay,
    TheMapsDisplay
  }
}
</script>

<template>
  <ThePageHero title="Analytics" subtitle="Get insights into our tree data"
               description="Filter based on the trees you wish to find"></ThePageHero>
  <div class="buttons is-centered mt-3">
    <button @click="this.currentDisplay = 'chart'" class="button is-info is-light">Chart</button>
    <button @click="this.currentDisplay = 'table'" class="button is-info is-light">Table</button>
    <button @click="this.currentDisplay = 'map'" class="button is-info is-light">Map</button>
    <button @click="this.currentDisplay = 'all'" class="button is-info is-light">All</button>

  </div>

  <div class="buttons is-centered mt-3">
    <div :class="this.groupByDropdownClass">
      <div class="dropdown-trigger" @click="switchDropdown()">
        <button class="button is-success is-light" aria-haspopup="true" aria-controls="dropdown-menu">
          {{ this.dropdownDisplayVal }}&ensp;
          <span class="icon is-small">
            <i class="fas fa-angle-down"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content" v-for="(val, name, index) in validGroupbyOptions" :key="index">
          <a class="dropdown-item" @click="this.updateGroupBy(name)">{{ val }}</a>
        </div>
      </div>
    </div>
    <button @click="resetToDefault()" class="button is-success is-light">Reset</button>
    <div v-if="Object.keys(this.filtersObj).length > 0" class="buttons is-centered">
      <div v-for="(val, name, index) in this.filtersObj" :key="index" @click="removeFilter(name)"
           class="button is-small">
        {{ this.groupbyOptions[name] }} = {{ val }}&nbsp;&nbsp;
        <span class="icon close-icon">
            <i class="fas fa-times"></i>
        </span>
      </div>
    </div>
  </div>
  <template v-if="this.loadingChart">
    <div class="box mx-5 mb-3 has-text-centered">
      <p class="title has-text-success has-text-centered">Loading data...</p>
    </div>
  </template>
  <template v-else>
    <div class="box mx-5 mb-3 has-text-centered" v-if="['chart', 'all'].includes(this.currentDisplay)">
      <div ref="chart-div" class="is-centered" id="chart_div"></div>
    </div>
    <div class="box mx-5 my-3 has-text-centered" v-if="['table', 'all'].includes(this.currentDisplay)">
      <TheTabularDisplay v-if="rowData" :table-col-map="colsToDisplayInTable" :api-info="rowData" :user-lat="userLat">
      </TheTabularDisplay>
    </div>
    <div class="box mx-5 my-3 has-text-centered" v-if="['map', 'all'].includes(this.currentDisplay)">
      <TheMapsDisplay v-if="rowData" :table-col-map="colsToDisplayInTable" :api-info="rowData" :user-lat="this.userLat"
                      :user-long="this.userLong" adjust-width="true" :heat-map-options="this.quantOptions">
      </TheMapsDisplay>
    </div>
  </template>
</template>

<style>
.button {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-icon {
  margin-left: 8px; /* Adjust the margin as needed */
}
</style>