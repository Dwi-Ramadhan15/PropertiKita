import React from 'react';
import {
  MdCameraAlt,
  MdEdit,
  MdSave,
  MdCancel,
  MdPerson
} from 'react-icons/md';

import useProfileUser from '../hooks/useProfileUser';

const ProfileUser = () => {
  const {
    user,
    loading,
    isEditing,
    selectedFile,
    preview,
    formData,
    setFormData,
    setIsEditing,
    fetchProfile,
    handleFileChange,
    handleUploadAvatar,
    handleUpdateInfo
  } = useProfileUser();

  if (loading) {
    return (
      <div className="text-center mt-20 text-lg font-bold">
        Memuat...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-20 text-red-500 font-bold">
        Data user tidak ditemukan
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-5">
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">

        {/* HEADER */}
        <div className="bg-slate-900 h-32 relative flex items-center justify-center">
          <h1 className="font-bold text-white text-center text-4xl tracking-tight">
            HALAMAN PROFIL {user.name}
          </h1>
        </div>

        <div className="px-8 pb-8">

          {/* FOTO */}
          <div className="relative -top-12 flex flex-col md:flex-row items-end gap-6">

            <div className="relative group">
              <img
                src={
                  preview ||
                  (user.foto_profil
                    ? `http://localhost:9000/propertikita/${user.foto_profil}`
                    : `https://ui-avatars.com/api/?name=${user.name}`)
                }
                alt="Profile"
                className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-lg"
              />

              <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-lg text-white cursor-pointer hover:bg-blue-700 shadow-md">
                <MdCameraAlt size={20} />

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-slate-800">
                {user.name}
              </h1>

              <p className="text-slate-500 uppercase">
                {user.role}
              </p>
            </div>

            {selectedFile && (
              <button
                onClick={handleUploadAvatar}
                className="mb-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
              >
                Simpan Foto Baru
              </button>
            )}
          </div>

          {/* IDENTITAS */}
          <div className="mt-4">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MdPerson className="text-blue-600" />
                Identitas Diri
              </h2>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 font-bold flex items-center gap-1 hover:underline"
                >
                  <MdEdit />
                  Edit
                </button>
              )}
            </div>

            <form
              onSubmit={handleUpdateInfo}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >

              {/* Nama */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  className={`w-full p-3 rounded-xl border ${
                    isEditing
                      ? 'border-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">
                  Email
                </label>

                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                  className={`w-full p-3 rounded-xl border ${
                    isEditing
                      ? 'border-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              {/* WA */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">
                  No. WhatsApp
                </label>

                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone_number: e.target.value
                    })
                  }
                  className={`w-full p-3 rounded-xl border ${
                    isEditing
                      ? 'border-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              {/* BUTTON */}
              {isEditing && (
                <div className="md:col-span-2 flex gap-3 pt-4">

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <MdSave size={20} />
                    Simpan Perubahan
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <MdCancel size={20} />
                    Batal
                  </button>

                </div>
              )}

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;