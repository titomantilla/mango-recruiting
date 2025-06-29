'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useAuth } from '../lib/auth';
import RichTextEditor from './RichTextEditor';
import { db } from '../lib/firebase';

export default function CommentsSection({ positionId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Carga inicial de comentarios
  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'positions', positionId, 'comments'),
          orderBy('createdAt', 'asc')
        );
        const snapshot = await getDocs(q);
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error cargando comentarios:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [positionId]);

  // Añadir nuevo comentario
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const docRef = await addDoc(
        collection(db, 'positions', positionId, 'comments'),
        {
          text: newComment,
          author: user.email,
          createdAt: serverTimestamp()
        }
      );
      setComments(prev => [
        ...prev,
        { id: docRef.id, text: newComment, author: user.email, createdAt: new Date() }
      ]);
      setNewComment('');
    } catch (err) {
      console.error('Error añadiendo comentario:', err);
    }
  };

  // Eliminar comentario
  const handleDeleteComment = async (commentId) => {
    if (!confirm('¿Deseas eliminar este comentario?')) return;
    try {
      await deleteDoc(doc(db, 'positions', positionId, 'comments', commentId));
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error eliminando comentario:', err);
    }
  };

  // Iniciar edición de comentario
  const handleEditComment = (comment) => {
    setEditingId(comment.id);
    setEditingText(comment.text);
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    try {
      const commentRef = doc(db, 'positions', positionId, 'comments', editingId);
      await updateDoc(commentRef, { text: editingText });
      setComments(prev =>
        prev.map(c =>
          c.id === editingId ? { ...c, text: editingText } : c
        )
      );
      setEditingId(null);
      setEditingText('');
    } catch (err) {
      console.error('Error actualizando comentario:', err);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="border-t border-gray-700 pt-6 mt-6">
      <h2 className="text-xl font-bold mb-4 text-mango-accent">Comentarios</h2>

      {loading ? (
        <p className="text-gray-300">Cargando comentarios…</p>
      ) : comments.map(c => (
        <div key={c.id} className="mb-4 bg-gray-800 p-4 rounded">
          {editingId === c.id ? (
            <>
              <RichTextEditor
                value={editingText}
                onChange={setEditingText}
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-mango-accent hover:bg-mango-accent-dark text-gray-900 font-bold py-1 px-3 rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="rich-text-content mb-2"
                dangerouslySetInnerHTML={{ __html: c.text }}
              />
              <p className="text-sm text-gray-500 mb-2">
                — {c.author} ·{' '}
                {c.createdAt?.toDate
                  ? c.createdAt.toDate().toLocaleString()
                  : new Date(c.createdAt).toLocaleString()}
              </p>
              {c.author === user.email && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditComment(c)}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Sección de nuevo comentario */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-200">Deja un comentario</h3>
        <textarea
          className="w-full bg-gray-700 text-white p-4 rounded min-h-[150px] focus:outline-none"
          placeholder="Escribe tu comentario aquí..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button
          onClick={handleAddComment}
          className="mt-2 bg-mango-accent hover:bg-mango-accent-dark text-gray-900 font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={!newComment.trim() || !user}>
          Publicar comentario
        </button>
      </div>
    </div>
  );
}
