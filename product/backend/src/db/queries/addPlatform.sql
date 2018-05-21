INSERT INTO Platforms VALUES(
  $(id),
  $(user_id),
  $(platform_id),
  $(platform_type)
) RETURNING *