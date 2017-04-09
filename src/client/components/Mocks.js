/** @module client/components/Mocks */

/* eslint-disable import/no-extraneous-dependencies */
import 'isomorphic-fetch';

import Logger from '../logger';

/**
 * The component for mock data manager.
 */
export default {
  data() {
    return {
      mocks: [],
      updatable: true,
      error: null,
    };
  },

  methods: {
    /**
     * Update mock setting.
     *
     * @param {string} id - The mock ID.
     * @param {string} parser - New parser name.
     */
    async update(id, parser) {
      try {
        this.updatable = false;
        await fetch(`/api/mocks/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parser,
          }),
        });
      } catch (e) {
        Logger.error('Request was failed', e);
      } finally {
        this.updatable = true;
      }
    },
  },

  created() {
    fetch('/api/mocks')
      .then(response => response.json())
      .then((json) => { this.mocks = json; })
      .catch((e) => {
        Logger.error('Request was failed', e);
        this.error = 'Error: Could not get mock data.';
      });
  },
};
