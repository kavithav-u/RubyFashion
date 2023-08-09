function openEditModal(categoryId) {
    // Set the form action URL dynamically based on the category ID
    document.getElementById('editForm').action = '/admin/categories/edit/' + categoryId;
    $('#editModal').modal('show');
  }