<template>
  <div class="col-md-5">
    <div id="mocks">
      <div class="row mock" v-for="mock in mocks">
        <div class="col-md-2 mock__method">
          <span class="label label-primary">
            {{ mock.mock.method }}
          </span>
        </div>
        <div class="col-md-5 mock__urlPath">
          {{ mock.mock.urlPath }}
        </div>
        <div class="col-md-5 mock__parser">
          <select
            class="form-control"
            v-model="mock.parsers.current"
            v-bind:disabled="!updatable"
            v-on:change="update(mock.mock.id, mock.parsers.current)">
            <option v-for="parser in mock.parsers.parsers" v-bind:value="parser">
              {{ parser }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Mocks.js"></script>

<style lang="stylus" scoped>
.mock
  margin-bottom: 4px
</style>
