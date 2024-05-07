import { Fragment, useCallback, useMemo, useState } from 'react';
import { RotateCw, Search, Loader } from 'lucide-react';

import { Header, MapView, NoFoundSearch, ShelterListItem } from '@/components';
import { Input } from '@/components/ui/input';
import { useShelters, useThrottle } from '@/hooks';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { data: shelters, loading, refresh } = useShelters();
  const [searchValue, setSearchValue] = useState<string>('');
  const [, setSearch] = useThrottle<string>(
    {
      throttle: 400,
      callback: (v) => {
        const params = {
          search: `address:contains:${v},name:contains:${v}`,
          or: 'true',
        };
        refresh({
          params: v ? params : {},
        });
      },
    },
    []
  );
  const hasMore = useMemo(
    () => shelters.page * shelters.perPage < shelters.count,
    [shelters.page, shelters.perPage, shelters.count]
  );

  const handleFetchMore = useCallback(() => {
    const params = {
      page: shelters.page + 1,
      perPage: shelters.perPage,
    };

    if (searchValue)
      Object.assign(params, {
        search: `address:contains:${searchValue},name:contains:${searchValue}`,
        or: 'true',
      });

    refresh(
      {
        params,
      },
      true
    );
  }, [refresh, searchValue, shelters.page, shelters.perPage]);

  return (
    <div className="flex flex-col h-screen items-center relative">
      <Header
        title="SOS Rio Grande do Sul"
        className="z-10"
        endAdornment={
          <Button
            loading={loading}
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            className="disabled:bg-red-500 hover:bg-red-400"
          >
            <RotateCw size={20} className="stroke-white" />
          </Button>
        }
      />
      <MapView />
      <div className="flex h-full flex-col-reverse justify-between pt-4 md:flex-row gap-4 md:p-4 w-full">
        <div className="flex-1 flex flex-col max-h-[40vh] md:max-h-[93vh] min-w-96 w-full md:max-w-md rounded-lg p-4 gap-4 z-10 bg-card shadow-md">
          <h1 className="text-[#2f2f2f] font-semibold text-2xl">
            Abrigos disponíveis ({shelters.count})
          </h1>
          <main className="flex w-full overflow-y-auto flex-col gap-4">
            {loading ? (
              <Loader className="justify-self-center self-center w-5 h-5 animate-spin" />
            ) : shelters.results.length === 0 ? (
              <NoFoundSearch />
            ) : (
              <Fragment>
                {shelters.results.map((s, idx) => (
                  <ShelterListItem key={idx} data={s} />
                ))}
                {hasMore ? (
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 py-2"
                    size="sm"
                    loading={loading}
                    onClick={handleFetchMore}
                  >
                    Carregar mais
                  </Button>
                ) : (
                  <p className="text-muted-foreground font-semibold">
                    Não há mais registros
                  </p>
                )}
              </Fragment>
            )}
          </main>
        </div>
        <div className="w-full px-4 md:max-w-4xl shadow-sm mx-auto">
          <div className="relative">
            <Input
              placeholder="Buscar por abrigo ou endereço"
              className="h-12 text-md font-medium text-zinc-600 pl-10 pr-4"
              onChange={(ev) => {
                setSearchValue(ev.target.value);
                setSearch(ev.target.value);
              }}
              value={searchValue}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search name="search" size="20" className="stroke-zinc-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Home };
