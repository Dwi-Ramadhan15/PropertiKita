import React from 'react';
import {
  MdCameraAlt,
  MdSave,
  MdCancel
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
    <div className="max-w-5xl mx-auto p-6">
      
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-6 text-slate-700">
        Kelola Profil
      </h1>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-8 items-start">

        {/* AVATAR */}
        <div className="flex flex-col items-center w-full md:w-1/4">
          <div className="relative">
            <img
              src={
                preview ||
                (user.foto_profil
                  ? `http://localhost:9000/propertikita/${user.foto_profil}`
                  : `https://ui-avatars.com/api/?name=${user.name}`)
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#D9AB7B]"
            />

            <label className="absolute bottom-0 right-0 bg-white border p-1 rounded-full cursor-pointer shadow">
              <MdCameraAlt size={16} />

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <p className="mt-3 font-semibold text-sm text-center">
            {user.name}
          </p>
          <span className="text-xs text-gray-400">
            ({user.role})
          </span>

          {selectedFile && (
            <button
              onClick={handleUploadAvatar}
              className="mt-3 text-xs bg-blue-500 text-white px-3 py-1 rounded-md"
            >
              Upload
            </button>
          )}
        </div>

        {/* FORM */}
        <div className="flex-1 w-full">
          <form onSubmit={handleUpdateInfo} className="space-y-4">

            {/* Username */}
            <div>
              <label className="text-sm text-gray-600">Username</label>
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
                className={`w-full mt-1 p-3 rounded-lg border ${
                  isEditing
                    ? 'border-blue-500 bg-white'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
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
                className={`w-full mt-1 p-3 rounded-lg border ${
                  isEditing
                    ? 'border-blue-500 bg-white'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-sm text-gray-600">No. WhatsApp</label>
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
                className={`w-full mt-1 p-3 rounded-lg border ${
                  isEditing
                    ? 'border-blue-500 bg-white'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>

            {/* BUTTON */}
            <div className="flex gap-3 pt-4">

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-200 px-4 py-2 rounded-lg text-sm"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="bg-gray-300 px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    <MdCancel /> Batal
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    <MdSave /> Simpan Perubahan
                  </button>
                </>
              )}

            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfileUser;