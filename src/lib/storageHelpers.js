// src/lib/storageHelpers.js
// Fonctions utilitaires pour Firebase Storage — images des cartes

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Upload une image de carte vers Firebase Storage.
 * Chemin : /cards/{cardNumber}/photo.{ext}
 *
 * @param {string} cardNumber  — ex: "UCI-2025-001"
 * @param {File}   file        — fichier image sélectionné
 * @returns {Promise<string>}  — URL publique de téléchargement
 */
export async function uploadCardImage(cardNumber, file) {
  if (!cardNumber) throw new Error('cardNumber requis pour uploader une image')
  if (!file)       throw new Error('Aucun fichier fourni')

  // Valider le type MIME
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image (jpg, png, webp…)')
  }

  // Limiter la taille à 3 Mo
  if (file.size > 3 * 1024 * 1024) {
    throw new Error('Image trop grande (max 3 Mo)')
  }

  // Extension du fichier original
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg'

  // Référence Storage : cards/UCI-2025-001/photo.jpg
  const storageRef = ref(storage, `cards/${cardNumber}/photo.${ext}`)

  // Upload avec métadonnées
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  })

  // Retourner l'URL publique
  return getDownloadURL(snapshot.ref)
}

/**
 * Supprimer l'image d'une carte depuis Storage (optionnel, usage admin).
 * @param {string} imageUrl — URL Firebase Storage de l'image à supprimer
 */
export async function deleteCardImage(imageUrl) {
  if (!imageUrl) return
  try {
    const storageRef = ref(storage, imageUrl)
    await deleteObject(storageRef)
  } catch (err) {
    // Ignorer si le fichier n'existe plus
    console.warn('deleteCardImage:', err.message)
  }
}
