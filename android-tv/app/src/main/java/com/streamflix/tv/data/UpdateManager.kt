package com.streamflix.tv.data

import android.app.AlertDialog
import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.widget.Toast
import com.streamflix.tv.BuildConfig
import com.streamflix.tv.data.api.GitHubApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object UpdateManager {

    private const val GITHUB_API_URL = "https://api.github.com/"

    private val api: GitHubApi by lazy {
        Retrofit.Builder()
            .baseUrl(GITHUB_API_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(GitHubApi::class.java)
    }

    fun checkForUpdate(context: Context, manuallyTriggered: Boolean = false) {
        GlobalScope.launch(Dispatchers.Main) {
            try {
                if (manuallyTriggered) {
                    Toast.makeText(context, "Checking for updates...", Toast.LENGTH_SHORT).show()
                }

                val releases = withContext(Dispatchers.IO) {
                    api.getReleases()
                }

                // Filter for TV-specific release
                // We assume TV releases have tags containing "tv" (e.g. "tv-v1.0.1" or "v1.0.1-tv")
                // Or if your repo is mixed, look for an apk with 'tv' in the name.
                val tvRelease = releases.firstOrNull { release ->
                    release.tag_name.contains("tv", ignoreCase = true) || 
                    release.assets.any { it.name.contains("tv", ignoreCase = true) && it.name.endsWith(".apk") }
                }

                if (tvRelease != null) {
                    val latestVersion = tvRelease.tag_name.replace(Regex("[^0-9.]"), "") // Extract just numbers/dots
                    val currentVersion = BuildConfig.VERSION_NAME

                    if (isNewerVersion(currentVersion, latestVersion)) {
                        showUpdateDialog(context, tvRelease)
                    } else if (manuallyTriggered) {
                        Toast.makeText(context, "You are up to date! ($currentVersion)", Toast.LENGTH_SHORT).show()
                    }
                } else if (manuallyTriggered) {
                     // Fallback check if no specific TV tag found (maybe use latest if mixed repo wasn't intended?)
                     // For now, warn specific tag not found
                     Toast.makeText(context, "No TV updates found", Toast.LENGTH_SHORT).show()
                }

            } catch (e: Exception) {
                e.printStackTrace()
                if (manuallyTriggered) {
                    Toast.makeText(context, "Update check failed", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun isNewerVersion(current: String, latest: String): Boolean {
        try {
            val v1 = current.split(".").map { it.toInt() }
            val v2 = latest.split(".").map { it.toInt() }
            
            for (i in 0 until maxOf(v1.size, v2.size)) {
                val num1 = v1.getOrElse(i) { 0 }
                val num2 = v2.getOrElse(i) { 0 }
                if (num2 > num1) return true
                if (num1 > num2) return false
            }
        } catch (e: Exception) {
            return false
        }
        return false
    }

    private fun showUpdateDialog(context: Context, release: com.streamflix.tv.data.api.GitHubRelease) {
        val apkAsset = release.assets.find { it.name.endsWith(".apk") } ?: return

        AlertDialog.Builder(context)
            .setTitle("New Update Available")
            .setMessage("Version ${release.tag_name} is available. Do you want to download it?")
            .setPositiveButton("Download") { _, _ ->
                downloadUpdate(context, apkAsset.browser_download_url, apkAsset.name)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun downloadUpdate(context: Context, url: String, fileName: String) {
        try {
            val request = DownloadManager.Request(Uri.parse(url))
                .setTitle("Downloading Update")
                .setDescription("Downloading $fileName")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
                .setAllowedOverMetered(true)
                .setAllowedOverRoaming(true)

            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadManager.enqueue(request)
            
            Toast.makeText(context, "Download started...", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Download failed", Toast.LENGTH_SHORT).show()
        }
    }
}
