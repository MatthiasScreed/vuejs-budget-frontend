<template name="FileUpload.vue">
  <div class="file-upload-container">
    <!-- Zone de drop -->
    <div
      class="relative border-2 border-dashed rounded-xl p-6 transition-all duration-200"
      :class="[
      isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-purple-400 hover:bg-purple-50'
    ]"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled"
        @change="handleFileSelect"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >

      <!-- Upload Icon -->
      <div class="text-center">
        <div class="mx-auto w-12 h-12 mb-4 flex items-center justify-center">
          <svg v-if="!isDragging" class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
          </svg>
          <svg v-else class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <h3 class="text-sm font-medium text-gray-900 mb-2">
          {{ isDragging ? '📎 Relâcher pour déposer' : '📎 Télécharger des fichiers' }}
        </h3>

        <p class="text-xs text-gray-500 mb-2">
          {{ isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez ou cliquez pour sélectionner' }}
        </p>

        <p class="text-xs text-gray-400">
          {{ acceptText }} • Max {{ maxSizeText }} {{ multiple ? `• Max ${maxFiles} fichiers` : '' }}
        </p>
      </div>
    </div>

    <!-- Fichiers sélectionnés -->
    <div v-if="files.length > 0" class="mt-4 space-y-3">
      <h4 class="text-sm font-medium text-gray-900 flex items-center space-x-2">
        <span>📋</span>
        <span>Fichiers sélectionnés ({{ files.length }})</span>
      </h4>

      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <!-- File Icon -->
            <div class="flex-shrink-0">
              <span class="text-lg">{{ getFileIcon(file.type) }}</span>
            </div>

            <!-- File Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <span>{{ formatFileSize(file.size) }}</span>
                <span v-if="file.lastModified">•</span>
                <span v-if="file.lastModified">{{ formatDate(file.lastModified) }}</span>
              </div>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadProgress[index] !== undefined" class="flex-shrink-0">
              <div class="w-20 bg-gray-200 rounded-full h-2">
                <div
                  class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: uploadProgress[index] + '%' }"
                ></div>
              </div>
              <p class="text-xs text-center text-gray-500 mt-1">{{ uploadProgress[index] }}%</p>
            </div>

            <!-- Status -->
            <div v-else-if="uploadStatus[index]" class="flex-shrink-0">
              <span v-if="uploadStatus[index] === 'success'" class="text-green-500 text-lg">✅</span>
              <span v-else-if="uploadStatus[index] === 'error'" class="text-red-500 text-lg">❌</span>
              <span v-else class="text-gray-500 text-lg">⏳</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2 ml-3">
            <button
              v-if="!uploadProgress[index] && !uploadStatus[index]"
              type="button"
              @click="removeFile(index)"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Upload All Button -->
      <div v-if="files.length > 0 && !autoUpload" class="flex justify-end">
        <button
          @click="uploadAll"
          :disabled="isUploading"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <div v-if="isUploading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>{{ isUploading ? 'Upload en cours...' : '📤 Télécharger tout' }}</span>
        </button>
      </div>
    </div>

    <!-- Erreurs -->
    <div v-if="errors.length > 0" class="mt-4 space-y-2">
      <div
        v-for="(error, index) in errors"
        :key="index"
        class="flex items-center space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
      >
        <span>⚠️</span>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>
