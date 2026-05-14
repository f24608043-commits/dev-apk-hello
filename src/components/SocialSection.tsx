import { Youtube, Facebook } from 'lucide-react';

const youtubeChannels = [
  { name: 'Hakeem Muhammad Amin', url: 'https://www.youtube.com/@HakeemMuhammadAmin' },
  { name: 'Pak Nuskhe Tips', url: 'https://www.youtube.com/@paknuskhetips' },
  { name: 'Badshah Ameen', url: 'https://www.youtube.com/@badshahameen2621/videos' },
  { name: 'Pashto Health Tube', url: 'https://www.youtube.com/@pashtohealthtube1185/videos' },
  { name: 'Desi Jaribotian Qayumi', url: 'https://www.youtube.com/@desijaribotianqayumi7136' },
  { name: 'Featured Video', url: 'https://www.youtube.com/watch?v=nfHBzNwowaU' },
];

const facebookPages = [
  { name: 'Official Page 1', url: 'https://www.facebook.com/profile.php?id=100089422621139&rdid=qUzwJuk7U8mt1yHt&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F16sq6HM3Du%2F#' },
  { name: 'Official Page 2', url: 'https://www.facebook.com/profile.php?id=100087015782246&rdid=yomHnonvKcnohXTJ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1B8USoQizH%2F#' },
  { name: 'Official Page 3', url: 'https://www.facebook.com/profile.php?id=100088256957967&rdid=tx1xAc2T9Yi2j3st&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F172NPPqU8y%2F#' },
  { name: 'Health Info Page', url: 'https://www.facebook.com/Ent.Info52?rdid=zTlSe3ylw9ojbGLm&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AtkeAYCXy%2F#' },
];

export default function SocialSection() {
  return (
    <section className="py-12 border-t border-black/10">
      <div className="container mx-auto px-4 text-center">
        {/* YouTube Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Youtube className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-black">YouTube Channels</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
            {youtubeChannels.map((channel, i) => (
              <div key={i} className="flex items-center">
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-black hover:text-red-600 transition-colors duration-300 group"
                >
                  <Youtube className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{channel.name}</span>
                </a>
                {i < youtubeChannels.length - 1 && (
                  <span className="ml-6 text-black/20 font-light">|</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Facebook Section */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Facebook className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-black">Facebook Pages</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
            {facebookPages.map((page, i) => (
              <div key={i} className="flex items-center">
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-black hover:text-blue-600 transition-colors duration-300 group"
                >
                  <Facebook className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{page.name}</span>
                </a>
                {i < facebookPages.length - 1 && (
                  <span className="ml-6 text-black/20 font-light">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
