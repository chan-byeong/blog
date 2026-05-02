interface AdminLoginSuccessResponse {
  success: true;
  redirectTo: string;
}

export type AdminClientLoginResult =
  | {
      success: true;
    }
  | {
      success: false;
    };

export async function loginAdminFromConsole({
  id,
  password,
}: {
  id: string;
  password: string;
}): Promise<AdminClientLoginResult> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        password,
      }),
    });

    if (!response.ok) {
      return { success: false };
    }

    const loginResponse = (await response.json()) as unknown;

    if (!isAdminLoginSuccessResponse(loginResponse)) {
      return { success: false };
    }

    window.location.assign(loginResponse.redirectTo);

    return { success: true };
  } catch {
    return { success: false };
  }
}

function isAdminLoginSuccessResponse(
  value: unknown
): value is AdminLoginSuccessResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'redirectTo' in value &&
    value.success === true &&
    typeof value.redirectTo === 'string' &&
    value.redirectTo.length > 0
  );
}
