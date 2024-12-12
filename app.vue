<template>
    <main class="container-fluid">
      <hgroup align="center">
        <h1>Minimal Webex Chat</h1>
      </hgroup>
      <form name="webex">
            <label for="room">Webex Room <a href=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                        height="24px"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                        <path
                            d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z" />
                    </svg></a></label>
            <select v-model="selectedRoom" id="room" @change="onselect(selectedRoom, $event)" :aria-invalid="selectInvalid" aria-describedby="select-invalid">
                <option selected disabled value>Select room ...</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.title }}</option>
            </select>
            <small v-if="selectInvalid" id="select-invalid">Please select a room!</small>
            <label for="message">Message</label>
            <input v-model="inputText" id="message" @input="oninput" :aria-invalid="inputInvalid" aria-describedby="input-invalid" type="text" placeholder="Input message ...">
            <small v-if="inputInvalid" id="input-invalid">Please input a message!</small>
            <input type="file" ref="fileInput" />
            <button ref="submitButton" @click="onsubmit">Send <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                    height="22px"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                    <path
                        d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                </svg></button>
        </form>
        <article class="alert" v-if="errorMessage" >
          {{ errorMessage }}
        </article> 
    </main>
</template>

<script>
export default {
  data() {
    return {
      rooms: [],
      selectedRoom: null,
      selectInvalid: false,
      inputText: '',
      inputInvalid: false,
      dataURL: null,
      filename: null,
      errorMessage: ''
    }
  },
  async mounted() {
    
    // Get Webex rooms
    try {
      const res = await fetch('/api/rooms', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const responseData = await res.json();
      if (responseData.status !== 'success') {
          console.error('Error:', responseData.message);
          this.errorMessage = `Error: ${responseData.message}`;
          return;
      }
      this.rooms = responseData.items;
    } catch (err) {
      console.error('Fetch error:', err.message);
      this.errorMessage = `Fetch error: ${err.message}`;
    }

    // Get a reference to the file input element
    const inputElement = this.$refs.fileInput;

    // Create a FilePond instance
    FilePond.registerPlugin(FilePondPluginFileEncode);
    FilePond.registerPlugin(FilePondPluginImagePreview);
    const pond = FilePond.create(inputElement);
    pond.imagePreviewMaxHeight = 100;

    // Get encoded data
    pond.onaddfile = (err, item) => {
      if (err) {
          console.error(err);
          return;
      }
      this.dataURL = item.getFileEncodeDataURL();
      this.filename = item.filename;
    }

    // register pond reset event 
    window.addEventListener('pondReset', e => {  
        pond.removeFiles()
    });

  },
  methods: {
    onselect() {
      if (this.selectedRoom) {
        this.selectInvalid = false
      }
    },

    oninput() {
      if (this.inputText) {
        this.inputInvalid = false
      } else {
        this.inputInvalid = true
      }
    },

    onsubmit(event) {
      event.preventDefault();
      if (!this.validateForm()) return;

      this.dataURL ? this.send2(this.selectedRoom, this.inputText, this.dataURL, this.filename) : this.send(this.selectedRoom, this.inputText);

      this.clearInputs();
    },

    validateForm() {
      let isValid = true;
      if (!this.selectedRoom) {
        this.selectInvalid = true;
        isValid = false;
      }
      if (!this.inputText && !this.dataURL) {
        this.inputInvalid = true;
        isValid = false;
      }
      return isValid;
    },

    clearInputs() {
      (async () => {
        const submitButton = this.$refs.submitButton;
        submitButton.setAttribute("aria-busy", true);
        await new Promise(resolve => setTimeout(resolve, 500));
        submitButton.setAttribute("aria-busy", false);

        this.inputText = '';
        this.inputInvalid = false;
        this.dataURL = null;
        this.filename = null;
        window.dispatchEvent(new Event('pondReset'));
      })();
    },

    // send text only
    async send(room, message) {
      try {
        const res = await fetch("/api/message", {
          method: "POST",
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ room: room, message: message })
        });
        const responseData = await res.json();
        if (responseData.status !== 'success') {
          console.error('Error:', responseData.message);
          this.errorMessage = `Error: ${responseData.message}`;
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        this.errorMessage = `Fetch error: ${err.message}`; 
      }
    },

    // send text and file
    async send2(room, message, dataURL, filename) {
      try {
        const res = await fetch("/api/file", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ room: room, message: message, dataURL: dataURL, filename: filename })
        });
        const responseData = await res.json();
        if (responseData.status !== 'success') {
          console.error('Error:', responseData.message);
          this.errorMessage = `Error: ${responseData.message}`;
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        this.errorMessage = `Fetch error: ${err.message}`; 
      }
    }
  } 
}
</script>

