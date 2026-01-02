package com.streamflix.tv.data.api

import retrofit2.http.GET

interface GitHubApi {
    @GET("repos/vndangkhoa/Streamflow/releases")
    suspend fun getReleases(): List<GitHubRelease>
}

data class GitHubRelease(
    val tag_name: String,
    val assets: List<GitHubAsset>
)

data class GitHubAsset(
    val browser_download_url: String,
    val name: String
)
