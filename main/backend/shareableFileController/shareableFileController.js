





drive.permissions.create({
    fileId: file.data.id, // Replace with the ID of the file you just uploaded
    requestBody: {
      role: 'writer',
      type: 'user',
      emailAddress: 'user@example.com' // Replace with the email address of the person you want to share the file with
    }
  }, function (err, permission) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('Permission ID:', permission.data.id);
    }
  });