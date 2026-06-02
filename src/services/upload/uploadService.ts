export async function uploadFile(uri: string) {
  return {
    uri,
    uploadedAt: new Date().toISOString(),
    status: 'mocked',
  };
}
