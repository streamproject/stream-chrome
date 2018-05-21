UPDATE users
  SET (username, email, password, phone, address, prof_pic, verified) = (
    COALESCE($(username), username),
    COALESCE($(email), email),
    COALESCE($(password), password),
    COALESCE($(phone), phone),
    COALESCE($(address), address),
    COALESCE($(prof_pic), prof_pic),
    COALESCE($(verified), verified)
  )
  WHERE id = $(id)
  RETURNING *
