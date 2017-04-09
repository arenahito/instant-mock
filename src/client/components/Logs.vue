<template>
  <div class="col-md-7">
    <div class="form-inline logController">
      <div class="checkbox logController__autoExpand">
        <label>
          <input type="checkbox" v-model="enableAutoExpand"> Auto Expand
        </label>
      </div>
      <button class="btn btn-default logController__expandAll" v-on:click="expandAll">Expand All</button>
      <button class="btn btn-default logController__collapseAll" v-on:click="collapseAll">Collapse All</button>
    </div>

    <div v-for="(log, index) in logs" transition="expand">
      <div
        class="panel log"
        :class="{
          'panel-success': log.success,
          'panel-warning': log.warning,
          'panel-danger': log.error
        }">
        <div class="panel-heading" @click="toggleLog(index)">
          {{ log.log.res.datetime }}
          {{ log.log.req.method }}
          {{ log.log.req.url }}
          <div
          class="status label"
          :class="{
            'label-success': log.success,
            'label-warning': log.warning,
            'label-danger': log.error
          }">
          {{ log.log.res.statusCode }}
          </div>
        </div>

        <ul class="list-group" v-show="log.show">
          <li class="list-group-item">
          <span class="label label-default">Request</span>

          <div class="row" v-for="(value, key) in log.log.req.headers">
            <div class="col-md-3">{{ key }}</div>
            <div class="col-md-9">{{ value }}</div>
          </div>

          <pre>{{ log.log.req.body }}</pre>
          </li>
          <li class="list-group-item">
          <span class="label label-default">Response</span>

          <div class="row" v-for="(value, key) in log.log.res.headers">
            <div class="col-md-3">{{ key }}</div>
            <div class="col-md-9">{{ value }}</div>
          </div>

          <pre>{{ log.log.res.body }}</pre>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script src="./Logs.js"></script>

<style lang="stylus" scoped>
.logController
  margin-bottom: 10px

  &__autoExpand
    margin-right: 8px

  &__expandAll
    margin-right: 8px

.log
  margin-bottom: 10px

</style>
